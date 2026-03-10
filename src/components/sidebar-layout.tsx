import AdUnit from "@/components/ad-unit";

type SidebarLayoutProps = {
  children: React.ReactNode;
  adSlot?: string;
};

const SidebarLayout = ({ children, adSlot = "default" }: SidebarLayoutProps) => (
  <div className="max-w-5xl lg:max-w-7xl mx-auto lg:flex lg:gap-6">
    <aside className="hidden lg:block w-[160px] shrink-0 sticky top-20 self-start">
      <AdUnit slot={`${adSlot}-left`} />
    </aside>
    <div className="flex-1 min-w-0">{children}</div>
    <aside className="hidden lg:block w-[160px] shrink-0 sticky top-20 self-start">
      <AdUnit slot={`${adSlot}-right`} />
    </aside>
  </div>
);

export default SidebarLayout;
