export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const percent = max ? Math.round((value / max) * 100) : 0;
  return <div className="progress-block"><div className="progress-label"><span>{label}</span><strong>{value}/{max}</strong></div><div className="progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}><span style={{ width: `${percent}%` }} /></div></div>;
}
