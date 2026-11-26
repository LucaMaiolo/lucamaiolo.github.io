// A two-column readout. Each row is [label, value, id?] so the runtime can update live values.
export default function Stats({ rows }) {
  return (
    <dl className="stats">
      {rows.map(([dt, dd, id]) => (
        <div key={dt} style={{ display: 'contents' }}>
          <dt>{dt}</dt>
          <dd id={id}>{dd}</dd>
        </div>
      ))}
    </dl>
  );
}
