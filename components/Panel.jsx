// A HUD panel. Only `marked` panels get the corner brackets, so the frame points at what matters.
export default function Panel({ as: Tag = 'div', className = '', marked = false, children, ...rest }) {
  return (
    <Tag className={`panel ${marked ? 'marked' : ''} ${className}`.replace(/\s+/g, ' ').trim()} {...rest}>
      {marked && <><i className="c1" /><i className="c2" /></>}
      {children}
    </Tag>
  );
}
