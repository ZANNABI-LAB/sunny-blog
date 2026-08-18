import Image from "next/image";
import Link from "next/link";
import Panel from "@/components/station/panel";

type OperatorCardProps = {
  className?: string;
};

/**
 * 이 정거장을 운영하는 사람.
 *
 * 그래프만 있던 메인에 없던 것이 이것이다 — 첫 화면에 사람이 있어야
 * "개인을 어필하는 페이지"가 성립한다.
 */
const OperatorCard = ({ className }: OperatorCardProps) => (
  <Panel label="OPERATOR" meta="ZL-1992" className={className}>
    <Link
      href="/profile"
      className="flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
    >
      <Image
        src="/images/mascot-96.png"
        alt=""
        width={48}
        height={48}
        className="shrink-0 [image-rendering:pixelated]"
      />
      <span className="flex min-w-0 flex-col">
        <b className="font-display text-caption text-text-primary">SHIN JUNGSUN</b>
        <span className="font-display text-caption text-text-muted">
          BACKEND DEVELOPER
        </span>
        <span className="font-display text-caption text-accent">VIEW PROFILE →</span>
      </span>
    </Link>
  </Panel>
);

export default OperatorCard;
