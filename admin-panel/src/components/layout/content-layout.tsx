
interface ContentLayoutProps {
  children: React.ReactNode;
}

export function ContentLayout({ children }: ContentLayoutProps) {
  return (
    <div>
      <div className="py-8 px-4 sm:px-8">{children}</div>
    </div>
  );
}
