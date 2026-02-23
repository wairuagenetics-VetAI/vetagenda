export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {children}
    </div>
  );
}
