/* Tweaks panel app — wires controls to the live N-body sim */
const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "trailLength": 0.55,
  "speed": 1.0
}/*EDITMODE-END*/;

function TweaksApp() {
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    const sim = window.__sim;
    if (!sim) return;
    sim.setOption("trailLength", t.trailLength);
    sim.setOption("speed", t.speed);
  }, [t.trailLength, t.speed]);

  return (
    <window.TweaksPanel title="Tweaks">
      <window.TweakSection label="Simulation">
        <window.TweakSlider
          label="Trail length"
          value={Math.round(t.trailLength * 100)}
          min={5} max={100} step={1} unit="%"
          onChange={(v) => setTweak("trailLength", v / 100)}
        />
        <window.TweakSlider
          label="Speed"
          value={t.speed}
          min={0.1} max={3} step={0.05} unit="×"
          onChange={(v) => setTweak("speed", v)}
        />
      </window.TweakSection>
    </window.TweaksPanel>
  );
}

const __twkRoot = document.createElement("div");
document.body.appendChild(__twkRoot);
ReactDOM.createRoot(__twkRoot).render(<TweaksApp />);
