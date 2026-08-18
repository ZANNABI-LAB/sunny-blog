import Image from "next/image";
import Link from "next/link";
import ConsolePrompt from "@/components/station/console-prompt";
import LatestFeed from "@/components/station/latest-feed";
import OperatorCard from "@/components/station/operator-card";
import Panel from "@/components/station/panel";
import SystemStatus from "@/components/station/system-status";
import type { PostMeta } from "@/types/post";

type MissionControlProps = {
  total: number;
  breakdown: [string, number][];
  latest: PostMeta[];
};

/**
 * 메인 화면 — 정거장 관제 콘솔.
 *
 * 데스크톱에서는 배경 이미지의 좌우 장비 사이 빈 공간에 패널을 얹고, 가운데
 * 에어록 창 자리에 콘솔과 최근 글을 놓는다. 모바일은 같은 부품을 세로로 쌓되
 * 배경은 질감으로만 남긴다 — 와이드 배경을 세로 화면에 우겨넣으면 좌우 장비가
 * 잘려 오히려 지저분해진다.
 */
const MissionControl = ({ total, breakdown, latest }: MissionControlProps) => (
  <div className="relative min-h-[calc(100dvh-var(--nav-height))] overflow-hidden">
    {/* 배경 — 정거장 관제실 */}
    <Image
      src="/images/station-hero.png"
      alt=""
      fill
      priority
      sizes="100vw"
      className="pointer-events-none select-none object-cover opacity-35 md:opacity-100"
    />
    {/* 배경 위 글자 가독성을 위한 감쇠 */}
    <div className="pointer-events-none absolute inset-0 bg-bg-primary/45 md:bg-bg-primary/25" />

    <div className="relative z-10 mx-auto flex max-w-wide flex-col gap-4 px-4 py-6 md:min-h-[calc(100dvh-var(--nav-height))] md:max-w-none md:grid md:grid-cols-[minmax(15rem,20%)_1fr_minmax(13rem,17%)] md:grid-rows-[auto_1fr_auto] md:gap-5 md:px-6 md:py-7">
      {/* 좌상 — 적재량 */}
      <SystemStatus
        total={total}
        breakdown={breakdown}
        className="md:col-start-1 md:row-start-1"
      />

      {/* 중앙 — 콘솔 + 최근 발행 (에어록 창 자리) */}
      <div className="flex flex-col items-center justify-center gap-5 md:col-start-2 md:row-span-2 md:row-start-1 md:px-6">
        <ConsolePrompt />
        <LatestFeed posts={latest} total={total} className="max-w-md" />
      </div>

      {/* 우상 — 외부 링크 */}
      <Panel
        label="UPLINK"
        className="md:col-start-3 md:row-start-1 md:self-start"
      >
        <ul className="flex flex-col gap-2">
          <li className="flex items-center justify-between gap-2">
            <span className="font-display text-caption text-text-muted">GITHUB</span>
            <a
              href="https://github.com/ZANNABI-LAB"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-caption text-text-primary hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
            >
              ZANNABI-LAB
            </a>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span className="font-display text-caption text-text-muted">ARCHIVE</span>
            <Link
              href="/tech"
              className="font-display text-caption text-text-primary hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
            >
              /TECH
            </Link>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span className="font-display text-caption text-text-muted">BOARD MAP</span>
            <Link
              href="/map"
              className="font-display text-caption text-text-primary hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
            >
              /MAP
            </Link>
          </li>
        </ul>
      </Panel>

      {/* 좌하 — 운영자 */}
      <OperatorCard className="md:col-start-1 md:row-start-2 md:self-end" />

      {/* 하단 — 워드마크 */}
      <div className="flex flex-col gap-1 md:col-start-3 md:row-start-2 md:self-end md:text-right">
        <b className="font-display text-h1 leading-none text-text-primary">
          DEEP
          <br />
          THOUGHT
        </b>
        <span className="font-display text-caption tracking-[0.16em] text-accent">
          A ZANNABI LAB STATION
        </span>
      </div>
    </div>
  </div>
);

export default MissionControl;
