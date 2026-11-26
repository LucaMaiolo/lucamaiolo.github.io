// HUD panel with the two corner brackets drawn by .c1 / .c2.
export default function Panel({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`panel ${className}`.trim()} {...rest}>
      <i className="c1" />
      <i className="c2" />
      {children}
    </Tag>
  );
}
