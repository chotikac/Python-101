import { useRef } from "react";

export default function Editor({ value, onChange }:{
  value: string; onChange: (v:string)=>void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <textarea
      ref={ref}
      className="form-control editor"
      spellCheck={false}
      value={value}
      onChange={(e)=>onChange(e.target.value)}
    />
  );
}