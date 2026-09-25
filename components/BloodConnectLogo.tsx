import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';

type BloodConnectLogoProps = {
  size?: number;
  showWordmark?: boolean;
};

export function BloodConnectLogo({ size = 132, showWordmark = true }: BloodConnectLogoProps) {
  const iconSize = size;
  return (
    <View style={styles.wrap}>
      <Svg width={iconSize} height={iconSize} viewBox="0 0 160 160" accessibilityLabel="BloodConnect Kolkata logo">
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#ffffff" />
            <Stop offset="1" stopColor="#fff0ee" />
          </LinearGradient>
          <LinearGradient id="drop" x1="0.2" y1="0" x2="0.85" y2="1">
            <Stop offset="0" stopColor="#ff4b43" />
            <Stop offset="0.45" stopColor="#e40014" />
            <Stop offset="1" stopColor="#8b0008" />
          </LinearGradient>
          <LinearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#ffd5cf" />
            <Stop offset="1" stopColor="#ff9d94" />
          </LinearGradient>
          <ClipPath id="dropClip">
            <Path d="M80 17 C61 46 35 70 35 97 C35 124 55 143 80 143 C105 143 125 124 125 97 C125 70 99 46 80 17 Z" />
          </ClipPath>
        </Defs>

        <Rect x="3" y="3" width="154" height="154" rx="34" fill="url(#bg)" />
        <Circle cx="80" cy="76" r="57" fill="#ffe8e3" opacity="0.7" />

        <Path
          d="M80 17 C61 46 35 70 35 97 C35 124 55 143 80 143 C105 143 125 124 125 97 C125 70 99 46 80 17 Z"
          fill="url(#drop)"
        />
        <Path
          d="M66 39 C70 32 77 23 80 19"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.75"
        />

        <G clipPath="url(#dropClip)">
          <Rect x="25" y="88" width="110" height="58" fill="url(#water)" opacity="0.92" />
          <Path d="M20 108 Q50 91 80 108 T140 108" fill="none" stroke="#fff7f5" strokeWidth="2" opacity="0.65" />
          <Path d="M20 118 Q50 101 80 118 T140 118" fill="none" stroke="#fff7f5" strokeWidth="2" opacity="0.5" />

          <G opacity="0.92" stroke="#ffffff" fill="none">
            <Line x1="29" y1="70" x2="131" y2="92" strokeWidth="2.5" />
            <Line x1="31" y1="84" x2="129" y2="103" strokeWidth="1.6" />
            <Line x1="35" y1="72" x2="52" y2="91" strokeWidth="1.5" />
            <Line x1="52" y1="76" x2="66" y2="94" strokeWidth="1.5" />
            <Line x1="66" y1="79" x2="80" y2="97" strokeWidth="1.5" />
            <Line x1="80" y1="82" x2="94" y2="100" strokeWidth="1.5" />
            <Line x1="94" y1="85" x2="108" y2="102" strokeWidth="1.5" />
            <Line x1="108" y1="88" x2="124" y2="105" strokeWidth="1.5" />
          </G>

          <G>
            <Rect x="57" y="87" width="46" height="25" rx="2" fill="#fffaf8" />
            <Rect x="72" y="81" width="16" height="31" rx="2" fill="#fffaf8" />
            <Circle cx="80" cy="79" r="5" fill="#fffaf8" />
            <Rect x="53" y="92" width="5" height="20" fill="#fffaf8" />
            <Rect x="102" y="92" width="5" height="20" fill="#fffaf8" />
            <Rect x="48" y="98" width="7" height="14" fill="#fffaf8" />
            <Rect x="105" y="98" width="7" height="14" fill="#fffaf8" />
            <Rect x="76" y="101" width="8" height="11" fill="#d90012" />
            <Path d="M64 91 h7 M89 91 h7 M64 98 h7 M89 98 h7" stroke="#d90012" strokeWidth="2" />
          </G>
        </G>
      </Svg>

      {showWordmark ? (
        <View style={styles.wordmarkWrap}>
          <Text style={styles.wordmark}>
            <Text style={styles.wordmarkRed}>Blood</Text>
            <Text style={styles.wordmarkDark}>Connect</Text>
          </Text>
          <View style={styles.cityRow}>
            <View style={styles.cityRule} />
            <Text style={styles.city}>KOLKATA</Text>
            <View style={styles.cityRule} />
          </View>
          <Text style={styles.tagline}>Every Drop Can Save a Life</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmarkWrap: {
    alignItems: 'center',
    marginTop: 7,
  },
  wordmark: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  wordmarkRed: {
    color: '#c9000d',
  },
  wordmarkDark: {
    color: '#191c1e',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 2,
  },
  cityRule: {
    width: 28,
    height: 1,
    backgroundColor: '#c9000d',
    opacity: 0.8,
  },
  city: {
    color: '#191c1e',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 3.1,
  },
  tagline: {
    color: '#59413e',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
    letterSpacing: 0.7,
  },
});
