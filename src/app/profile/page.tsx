import Image from "next/image";
import { ContactLinks } from "@/components/contact-links";

/* ── Data ── */

const skills = {
  Backend: ["TBD"],
  Frontend: ["TBD"],
  Database: ["TBD"],
  DevOps: ["TBD"],
  "AI / Tools": ["TBD"],
};

interface Project {
  title: string;
  problem: string;
  solution: string;
  result: string;
  techs: string[];
}

interface Experience {
  company: string;
  position: string;
  period: string;
  description: string;
  projects: Project[];
}

const experiences: Experience[] = [
  {
    company: "TBD",
    position: "TBD",
    period: "TBD",
    description: "TBD",
    projects: [
      {
        title: "TBD",
        problem: "TBD",
        solution: "TBD",
        result: "TBD",
        techs: ["TBD"],
      },
    ],
  },
  // 경력을 추가하려면 위 구조를 복사하세요
];

const sideProjects = [
  {
    title: "TBD",
    period: "TBD",
    description: "TBD",
    techs: ["TBD"],
    link: "",
  },
];

const certifications = [
  {
    name: "정보처리기사",
    issuer: "한국산업인력공단",
    date: "2024.06",
  },
  {
    name: "AWS Certified Cloud Practitioner (CLF)",
    issuer: "Amazon Web Services",
    date: "2024.04",
  },
];

const education = [
  {
    school: "학점은행",
    major: "컴퓨터공학",
    period: "2016.03 — 2024.08",
    degree: "학사",
  },
  {
    school: "웅지세무대학교",
    major: "회계정보과",
    period: "2011.03 — 2016.02",
    degree: "전문학사",
  },
];

const activities = [
  {
    title: "TBD",
    organization: "TBD",
    period: "TBD",
    description: "TBD",
  },
];

/* ── Components ── */

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-display text-lg text-accent tracking-[0.15em] uppercase mb-6">
    <span className="inline-block w-2 h-2 rounded-full bg-accent mr-2 align-middle" />
    {children}
  </h2>
);

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs text-text-secondary border border-border rounded px-2 py-1 hover:border-accent/40 transition-colors">
    {children}
  </span>
);

/* ── Page ── */

const ProfilePage = () => {
  return (
    <div className="max-w-5xl mx-auto animate-page-fade-in space-y-16">
      {/* Hero */}
      <header className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="relative shrink-0">
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-2 border-accent ring-4 ring-accent/10">
            <Image
              src="/images/profile.png"
              alt="Sunny profile"
              width={176}
              height={176}
              className="object-cover"
              priority
            />
          </div>
        </div>
        <div className="text-center md:text-left">
          <h1 className="font-display text-5xl md:text-7xl font-bold text-text-primary tracking-tight text-glow-amber">
            SUNNY
          </h1>
          <p className="mt-1 font-display text-xs text-text-muted tracking-[0.2em] uppercase">
            신중선 · Backend Developer
          </p>
          <p className="mt-4 text-text-secondary text-sm md:text-base leading-relaxed max-w-2xl">
            지속 가능한 시스템 설계를 지향하며,
            <br />
            AI Native 워크플로우를 구축하여 생산성과 문제해결능력을 높이고자
            노력합니다.
          </p>
          <div className="mt-4">
            <p className="font-display text-[10px] text-text-muted tracking-[0.2em] uppercase mb-2">
              Contact
            </p>
            <ContactLinks />
          </div>
        </div>
      </header>

      {/* About — 스토리텔링 */}
      <section>
        <SectionHeader>About</SectionHeader>
        <div className="border border-border rounded-lg p-6 bg-card space-y-4">
          <p className="text-text-secondary text-sm md:text-base leading-relaxed">
            TBD
          </p>
        </div>
      </section>

      {/* Experience — 회사 경력 + 프로젝트 */}
      <section>
        <SectionHeader>Experience</SectionHeader>
        <div className="space-y-8">
          {experiences.map((exp, i) => (
            <div
              key={exp.company}
              className="border border-border rounded-lg bg-card overflow-hidden animate-stagger-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* 회사 헤더 */}
              <div className="p-6 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="font-display text-base font-bold text-text-primary tracking-wide uppercase">
                      {exp.company}
                    </h3>
                    <p className="text-text-secondary text-sm mt-0.5">
                      {exp.position}
                    </p>
                  </div>
                  <span className="font-display text-xs text-accent tracking-wider shrink-0">
                    {exp.period}
                  </span>
                </div>
                <p className="text-text-muted text-sm mt-3">
                  {exp.description}
                </p>
              </div>

              {/* 프로젝트 목록 */}
              <div className="divide-y divide-border">
                {exp.projects.map((project) => (
                  <div key={project.title} className="p-6 space-y-3">
                    <h4 className="font-display text-sm font-bold text-text-primary tracking-wide">
                      {project.title}
                    </h4>

                    <div className="space-y-2">
                      <div className="flex gap-3">
                        <span className="shrink-0 font-display text-[10px] text-accent tracking-widest uppercase mt-0.5 w-16">
                          Problem
                        </span>
                        <p className="text-text-secondary text-sm leading-relaxed">
                          {project.problem}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <span className="shrink-0 font-display text-[10px] text-accent tracking-widest uppercase mt-0.5 w-16">
                          Solution
                        </span>
                        <p className="text-text-secondary text-sm leading-relaxed">
                          {project.solution}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <span className="shrink-0 font-display text-[10px] text-accent tracking-widest uppercase mt-0.5 w-16">
                          Result
                        </span>
                        <p className="text-text-secondary text-sm leading-relaxed">
                          {project.result}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {project.techs.map((tech) => (
                        <Tag key={tech}>{tech}</Tag>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Side Projects */}
      <section>
        <SectionHeader>Side Projects</SectionHeader>
        <div className="space-y-4">
          {sideProjects.map((project, i) => (
            <div
              key={project.title}
              className="border border-border rounded-lg p-6 bg-card hover:border-accent/30 transition-colors animate-stagger-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <h3 className="font-display text-sm font-bold text-text-primary tracking-wide uppercase">
                  {project.title}
                </h3>
                <span className="font-display text-xs text-accent tracking-wider">
                  {project.period}
                </span>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-3">
                {project.description}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {project.techs.map((tech) => (
                  <Tag key={tech}>{tech}</Tag>
                ))}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto font-display text-xs text-accent hover:underline tracking-wider"
                  >
                    Visit →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Activities */}
      <section>
        <SectionHeader>Activities</SectionHeader>
        <div className="space-y-4">
          {activities.map((activity, i) => (
            <div
              key={activity.title}
              className="border border-border rounded-lg p-6 bg-card hover:border-accent/30 transition-colors animate-stagger-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-display text-sm font-bold text-text-primary tracking-wide uppercase">
                    {activity.title}
                  </h3>
                  <p className="text-text-muted text-xs mt-0.5">
                    {activity.organization}
                  </p>
                </div>
                <span className="font-display text-xs text-accent tracking-wider shrink-0">
                  {activity.period}
                </span>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                {activity.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section>
        <SectionHeader>Skills</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(skills).map(([category, items], i) => (
            <div
              key={category}
              className="border border-border rounded-lg p-5 bg-card animate-stagger-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <h3 className="font-display text-xs text-accent tracking-[0.15em] uppercase mb-3">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <Tag key={skill}>{skill}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section>
        <SectionHeader>Certifications</SectionHeader>
        <div className="space-y-4">
          {certifications.map((cert, i) => (
            <div
              key={cert.name}
              className="border border-border rounded-lg p-6 bg-card animate-stagger-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-display text-sm font-bold text-text-primary tracking-wide uppercase">
                    {cert.name}
                  </h3>
                  <p className="text-text-muted text-xs mt-0.5">
                    {cert.issuer}
                  </p>
                </div>
                <span className="font-display text-xs text-accent tracking-wider shrink-0">
                  {cert.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section>
        <SectionHeader>Education</SectionHeader>
        <div className="space-y-4">
          {education.map((edu, i) => (
            <div
              key={edu.school}
              className="border border-border rounded-lg p-6 bg-card animate-stagger-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-display text-sm font-bold text-text-primary tracking-wide uppercase">
                    {edu.school}
                  </h3>
                  <p className="text-text-secondary text-sm mt-0.5">
                    {edu.major} · {edu.degree}
                  </p>
                </div>
                <span className="font-display text-xs text-accent tracking-wider shrink-0">
                  {edu.period}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default ProfilePage;
