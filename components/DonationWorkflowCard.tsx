import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

type WorkflowStage =
  | 'accepted'
  | 'coming_to_hospital'
  | 'arrived'
  | 'screening'
  | 'eligible'
  | 'donating'
  | 'completed';

type WorkflowRow = {
  id: string;
  request_id: string;
  donor_response_id: string;
  donor_id: string;
  stage: WorkflowStage;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

type AcceptedResponse = {
  id: string;
  donor_id: string;
  status: string;
};

const stageMeta: Record<WorkflowStage, { title: string; description: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  accepted: {
    title: 'Donor Accepted',
    description: 'The donor has accepted the blood-help request. The next step is travelling to the hospital.',
    icon: 'hand-heart-outline',
  },
  coming_to_hospital: {
    title: 'Coming to Hospital',
    description: 'The selected donor has indicated that they are on the way.',
    icon: 'walk',
  },
  arrived: {
    title: 'Arrived',
    description: 'The donor has reported arrival. Hospital medical screening is the next step.',
    icon: 'hospital-marker',
  },
  screening: {
    title: 'Medical Screening',
    description: 'Hospital staff must perform and decide the medical screening. This app stores only the coordination status.',
    icon: 'clipboard-pulse-outline',
  },
  eligible: {
    title: 'Eligible to Donate',
    description: 'This stage should only be marked after hospital medical staff confirm the donor is eligible to donate.',
    icon: 'shield-check-outline',
  },
  donating: {
    title: 'Donation in Progress',
    description: 'The donor has reported that donation is in progress at the hospital.',
    icon: 'water-plus-outline',
  },
  completed: {
    title: 'Donation Completed',
    description: 'The donation has been reported complete. Hospital records remain the source of truth.',
    icon: 'check-circle-outline',
  },
};

const orderedStages: WorkflowStage[] = [
  'accepted',
  'coming_to_hospital',
  'arrived',
  'screening',
  'eligible',
  'donating',
  'completed',
];

function stageIndex(stage: WorkflowStage) {
  return orderedStages.indexOf(stage);
}

export function DonationWorkflowCard({ requestId }: { requestId: string }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [workflow, setWorkflow] = useState<WorkflowRow | null>(null);
  const [acceptedResponses, setAcceptedResponses] = useState<AcceptedResponse[]>([]);
  const [requesterId, setRequesterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const refresh = useCallback(async (showLoading = false) => {
    if (!userId || !requestId) return;
    if (showLoading) setLoading(true);
    setErrorMessage('');

    const [requestResult, workflowResult, responseResult] = await Promise.all([
      supabase.from('blood_requests').select('requester_id').eq('id', requestId).maybeSingle(),
      supabase
        .from('donation_workflows')
        .select('id, request_id, donor_response_id, donor_id, stage, created_at, updated_at, completed_at')
        .eq('request_id', requestId)
        .maybeSingle(),
      supabase
        .from('donor_responses')
        .select('id, donor_id, status')
        .eq('request_id', requestId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: true }),
    ]);

    if (requestResult.error) {
      setErrorMessage(requestResult.error.message);
    } else {
      setRequesterId(requestResult.data?.requester_id ?? null);
    }

    if (workflowResult.error) {
      setErrorMessage((current) => current || workflowResult.error?.message || 'Unable to load donation workflow.');
    } else {
      setWorkflow((workflowResult.data as WorkflowRow | null) ?? null);
    }

    if (!responseResult.error) {
      setAcceptedResponses((responseResult.data || []) as AcceptedResponse[]);
    }

    if (showLoading) setLoading(false);
  }, [requestId, userId]);

  useEffect(() => {
    const initialLoad = setTimeout(() => {
      void refresh(true);
    }, 0);
    const interval = setInterval(() => void refresh(false), 5000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [refresh]);

  const selectDonor = async (responseId: string) => {
    setBusy(true);
    setErrorMessage('');
    const result = await supabase.rpc('select_donor_for_request', {
      p_request_id: requestId,
      p_donor_response_id: responseId,
    });

    if (result.error) {
      setErrorMessage(result.error.message);
      setBusy(false);
      return;
    }

    await refresh(false);
    setBusy(false);
    Alert.alert('Donor selected', 'The selected donor is now on the post-acceptance donation workflow.');
  };

  const advance = async (nextStage: WorkflowStage) => {
    if (!workflow) return;

    if (nextStage === 'eligible') {
      Alert.alert(
        'Hospital confirmation required',
        'Only mark this stage after hospital medical staff confirm that the donor is medically eligible to donate.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: async () => {
              await performAdvance(nextStage);
            },
          },
        ],
      );
      return;
    }

    await performAdvance(nextStage);
  };

  const performAdvance = async (nextStage: WorkflowStage) => {
    if (!workflow) return;
    setBusy(true);
    setErrorMessage('');

    const result = await supabase.rpc('advance_donation_workflow', {
      p_workflow_id: workflow.id,
      p_next_stage: nextStage,
    });

    if (result.error) {
      setErrorMessage(result.error.message);
      setBusy(false);
      return;
    }

    await refresh(false);
    setBusy(false);
  };

  if (loading) {
    return (
      <View style={workflowStyles.card}>
        <Text style={workflowStyles.loadingText}>Loading donation workflow…</Text>
      </View>
    );
  }

  const isRequester = requesterId === user?.id;
  const isSelectedDonor = workflow?.donor_id === user?.id;
  const currentStage = workflow?.stage ?? null;
  const meta = currentStage ? stageMeta[currentStage] : null;

  const nextAction =
    currentStage === 'accepted' && isSelectedDonor
      ? { stage: 'coming_to_hospital' as WorkflowStage, label: 'I’m on my way', icon: 'walk' as const }
      : currentStage === 'coming_to_hospital' && isSelectedDonor
        ? { stage: 'arrived' as WorkflowStage, label: 'I’ve arrived at the hospital', icon: 'hospital-marker' as const }
        : currentStage === 'arrived' && isRequester
          ? { stage: 'screening' as WorkflowStage, label: 'Report screening started', icon: 'clipboard-pulse-outline' as const }
          : currentStage === 'screening' && isRequester
            ? { stage: 'eligible' as WorkflowStage, label: 'Report hospital eligibility', icon: 'shield-check-outline' as const }
            : currentStage === 'eligible' && isSelectedDonor
              ? { stage: 'donating' as WorkflowStage, label: 'I’m donating now', icon: 'water-plus-outline' as const }
              : currentStage === 'donating' && (isSelectedDonor || isRequester)
                ? { stage: 'completed' as WorkflowStage, label: 'Mark donation completed', icon: 'check-circle-outline' as const }
                : null;

  if (!workflow) {
    if (isRequester && acceptedResponses.length > 0) {
      return (
        <View style={workflowStyles.card}>
          <View style={workflowStyles.headerRow}>
            <View style={workflowStyles.iconCircle}>
              <MaterialCommunityIcons name="account-check-outline" size={20} color="#760009" />
            </View>
            <View style={workflowStyles.headerCopy}>
              <Text style={workflowStyles.title}>Select an accepted donor</Text>
              <Text style={workflowStyles.subtitle}>
                One accepted donor can be selected for the live donation workflow.
              </Text>
            </View>
          </View>

          {acceptedResponses.map((response, index) => (
            <View key={response.id} style={workflowStyles.selectionRow}>
              <View style={workflowStyles.initialCircle}>
                <Text style={workflowStyles.initialText}>D{index + 1}</Text>
              </View>
              <View style={workflowStyles.selectionCopy}>
                <Text style={workflowStyles.selectionTitle}>Accepted donor {index + 1}</Text>
                <Text style={workflowStyles.selectionSubtitle}>Donor identity remains protected in the requester view.</Text>
              </View>
              <Pressable
                style={workflowStyles.smallButton}
                disabled={busy}
                onPress={() => void selectDonor(response.id)}
              >
                <Text style={workflowStyles.smallButtonText}>{busy ? '...' : 'Select'}</Text>
              </Pressable>
            </View>
          ))}

          <View style={workflowStyles.notice}>
            <MaterialCommunityIcons name="information-outline" size={18} color="#760009" />
            <Text style={workflowStyles.noticeText}>
              Selecting a donor does not confirm blood eligibility. Medical screening must still be completed at the hospital.
            </Text>
          </View>
          {errorMessage ? <Text style={workflowStyles.error}>{errorMessage}</Text> : null}
        </View>
      );
    }

    if (!isRequester) {
      const acceptedByCurrentDonor = acceptedResponses.some((response) => response.donor_id === user?.id);
      if (acceptedByCurrentDonor) {
        return (
          <View style={workflowStyles.card}>
            <View style={workflowStyles.headerRow}>
              <View style={workflowStyles.iconCircle}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#760009" />
              </View>
              <View style={workflowStyles.headerCopy}>
                <Text style={workflowStyles.title}>Waiting for donor selection</Text>
                <Text style={workflowStyles.subtitle}>
                  You accepted this blood request. The requester must select a donor before the post-acceptance workflow starts.
                </Text>
              </View>
            </View>
            {errorMessage ? <Text style={workflowStyles.error}>{errorMessage}</Text> : null}
          </View>
        );
      }
    }

    return null;
  }

  const progressPercent = ((stageIndex(currentStage as WorkflowStage) + 1) / orderedStages.length) * 100;

  return (
    <View style={workflowStyles.card}>
      <View style={workflowStyles.headerRow}>
        <View style={workflowStyles.iconCircle}>
          <MaterialCommunityIcons name={meta?.icon || 'timeline-check-outline'} size={20} color="#760009" />
        </View>
        <View style={workflowStyles.headerCopy}>
          <Text style={workflowStyles.title}>Donation Progress</Text>
          <Text style={workflowStyles.subtitle}>{meta?.title}</Text>
        </View>
        <Text style={workflowStyles.stepText}>{stageIndex(currentStage as WorkflowStage) + 1}/{orderedStages.length}</Text>
      </View>

      <View style={workflowStyles.progressTrack}>
        <View
          style={[
            workflowStyles.progressFill,
            { width: (progressPercent + '%') as `${number}%` },
          ]}
        />
      </View>

      <Text style={workflowStyles.stageDescription}>{meta?.description}</Text>

      <View style={workflowStyles.stageList}>
        {orderedStages.map((stage, index) => {
          const active = index <= stageIndex(currentStage as WorkflowStage);
          const stageItem = stageMeta[stage];
          return (
            <View key={stage} style={workflowStyles.stageRow}>
              <View style={[workflowStyles.stageDot, active && workflowStyles.stageDotActive]}>
                <MaterialCommunityIcons
                  name={active ? 'check' : stageItem.icon}
                  size={14}
                  color={active ? '#ffffff' : '#59413e'}
                />
              </View>
              <View style={workflowStyles.stageCopy}>
                <Text style={[workflowStyles.stageTitle, active && workflowStyles.stageTitleActive]}>{stageItem.title}</Text>
                <Text style={workflowStyles.stageHint}>
                  {stage === currentStage ? 'Current step' : active ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={workflowStyles.notice}>
        <MaterialCommunityIcons name="shield-check-outline" size={18} color="#760009" />
        <Text style={workflowStyles.noticeText}>
          Exact donor location and personal contact details stay protected. Hospital medical records are the source of truth for screening, eligibility and completed donation.
        </Text>
      </View>

      {nextAction ? (
        <Pressable
          style={workflowStyles.primaryButton}
          disabled={busy}
          onPress={() => void advance(nextAction.stage)}
        >
          <MaterialCommunityIcons name={nextAction.icon} size={19} color="#ffffff" />
          <Text style={workflowStyles.primaryButtonText}>{busy ? 'Updating…' : nextAction.label}</Text>
        </Pressable>
      ) : (
        <View style={workflowStyles.waitingBox}>
          <MaterialCommunityIcons name="clock-outline" size={18} color="#59413e" />
          <Text style={workflowStyles.waitingText}>
            {currentStage === 'completed'
              ? 'Workflow completed. Keep hospital documentation as the official donation record.'
              : isRequester
                ? 'Waiting for the selected donor or hospital-related step.'
                : 'Waiting for the requester or hospital-related step.'}
          </Text>
        </View>
      )}

      {errorMessage ? <Text style={workflowStyles.error}>{errorMessage}</Text> : null}
    </View>
  );
}

const workflowStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0d8d5',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  loadingText: {
    color: '#59413e',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#ffe3df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: '#191c1e',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#59413e',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  stepText: {
    color: '#760009',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#eceef0',
    overflow: 'hidden',
    marginTop: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#760009',
  },
  stageDescription: {
    color: '#59413e',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  stageList: {
    marginTop: 14,
    gap: 10,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stageDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d9dfe4',
    backgroundColor: '#f7f9fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageDotActive: {
    backgroundColor: '#760009',
    borderColor: '#760009',
  },
  stageCopy: {
    flex: 1,
  },
  stageTitle: {
    color: '#59413e',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  stageTitleActive: {
    color: '#191c1e',
  },
  stageHint: {
    color: '#8d706d',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f2e5e3',
    paddingTop: 12,
    marginTop: 12,
  },
  initialCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f2f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    color: '#760009',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  selectionCopy: {
    flex: 1,
  },
  selectionTitle: {
    color: '#191c1e',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  selectionSubtitle: {
    color: '#8d706d',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
  },
  smallButton: {
    backgroundColor: '#760009',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  smallButtonText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fff7f5',
    borderRadius: 12,
    padding: 10,
    marginTop: 14,
  },
  noticeText: {
    flex: 1,
    color: '#59413e',
    fontSize: 11,
    lineHeight: 16,
  },
  primaryButton: {
    backgroundColor: '#760009',
    borderRadius: 14,
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  waitingBox: {
    backgroundColor: '#f7f9fb',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  waitingText: {
    flex: 1,
    color: '#59413e',
    fontSize: 12,
    lineHeight: 17,
  },
  error: {
    color: '#ba1a1a',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
  },
});
