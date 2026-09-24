declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const expoPushUrl = 'https://exp.host/--/api/v2/push/send';

Deno.serve(async (request: Request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const authorization = request.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!authorization || !supabaseUrl || !supabaseAnonKey) {
    return Response.json({ error: 'Missing authorization or Supabase configuration.' }, { status: 401 });
  }

  try {
    const { requestId, workflowId } = await request.json();
    const rpcName = typeof requestId === 'string'
      ? 'get_blood_request_push_targets'
      : typeof workflowId === 'string'
        ? 'get_workflow_push_targets'
        : null;
    const rpcArgs = rpcName === 'get_blood_request_push_targets'
      ? { p_request_id: requestId }
      : rpcName === 'get_workflow_push_targets'
        ? { p_workflow_id: workflowId }
        : null;
    if (!rpcName || !rpcArgs) return Response.json({ error: 'A valid requestId or workflowId is required.' }, { status: 400 });

    const targetsResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/${rpcName}`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rpcArgs),
    });
    if (!targetsResponse.ok) {
      return Response.json({ error: 'Could not load authorized notification recipients.' }, { status: targetsResponse.status });
    }

    const targets = await targetsResponse.json() as Array<Record<string, string>>;
    const messages = targets.map((target) => ({
      to: target.expo_push_token,
      sound: 'default',
      title: target.title || `New ${target.blood_group} blood request`,
      body: target.message || `A compatible blood request is open in ${target.city}. Open BloodConnect to respond.`,
      data: { requestId: target.request_id || requestId },
      channelId: 'blood-requests',
      priority: 'high',
    }));
    const tickets = [];
    for (let index = 0; index < messages.length; index += 100) {
      const response = await fetch(expoPushUrl, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(messages.slice(index, index + 100)),
      });
      if (!response.ok) throw new Error(`Expo Push Service returned ${response.status}.`);
      tickets.push(...await response.json().then((result) => result.data || []));
    }
    return Response.json({ sent: tickets.length });
  } catch (error) {
    console.error('Push delivery failed:', error);
    return Response.json({ error: 'Push delivery failed.' }, { status: 500 });
  }
});
