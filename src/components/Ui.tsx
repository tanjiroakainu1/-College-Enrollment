import React from "react";

export const Card = ({
  title,
  children,
  right,
  className = "",
  titleClassName = "",
}: {
  title?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}) => (
  <section
    className={`candy-card-hover rounded-2xl border-2 border-rose-400/35 bg-[#2a1018] p-4 shadow-[0_0_28px_rgba(244,63,94,0.22)] ${className}`}
  >
    {(title || right) && (
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className={`text-lg font-extrabold text-white ${titleClassName}`}>{title}</h3>
        {right}
      </header>
    )}
    {children}
  </section>
);

export const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-xl border-2 border-rose-200/40 bg-gradient-to-br from-rose-500 via-red-500 to-red-700 p-4 text-white shadow-[0_0_24px_rgba(244,63,94,0.5)]">
    <div className="text-xs font-bold uppercase tracking-wide text-white/90">{label}</div>
    <div className="mt-1 text-2xl font-extrabold text-white">{value}</div>
  </div>
);

export const Badge = ({ value }: { value: string }) => {
  const lower = value.toLowerCase();
  const klass =
    lower === "approved" || lower === "confirmed" || lower === "active"
      ? "border-2 border-emerald-300/60 bg-emerald-600/40 text-emerald-50"
      : lower === "pending"
        ? "border-2 border-amber-300/60 bg-amber-600/40 text-amber-50"
        : lower === "rejected" || lower === "inactive"
          ? "border-2 border-red-300/60 bg-red-600/40 text-red-50"
          : lower === "enrolled"
            ? "border-2 border-pink-300/60 bg-pink-600/40 text-pink-50"
            : "border-2 border-rose-300/50 bg-rose-600/30 text-rose-50";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${klass}`}>{value}</span>;
};

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full rounded-xl border-2 border-rose-300/50 bg-[#1a0810] px-3 py-2.5 text-sm font-medium text-white outline-none placeholder:text-rose-200/50 focus:border-rose-200 focus:ring-2 focus:ring-rose-400/40 ${props.className ?? ""}`}
  />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`w-full rounded-xl border-2 border-rose-300/50 bg-[#1a0810] px-3 py-2.5 text-sm font-medium text-white outline-none focus:border-rose-200 focus:ring-2 focus:ring-rose-400/40 ${props.className ?? ""}`}
  />
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full rounded-xl border-2 border-rose-300/50 bg-[#1a0810] px-3 py-2.5 text-sm font-medium text-white outline-none placeholder:text-rose-200/50 focus:border-rose-200 focus:ring-2 focus:ring-rose-400/40 ${props.className ?? ""}`}
  />
);

export const Button = ({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) => (
  <button
    {...props}
    className={`rounded-xl border-2 border-rose-200 bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(244,63,94,0.45)] hover:from-rose-400 hover:to-red-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);
