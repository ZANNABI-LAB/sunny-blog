import Image from "next/image";

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
    issuer: "TBD",
    date: "TBD",
  },
];

const education = [
  {
    school: "TBD",
    major: "TBD",
    period: "TBD",
    degree: "TBD",
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
            AI Native한 워크플로우를 구축하여 생산성과 문제해결능력을 높이고자
            노력합니다.
          </p>
          <div className="mt-4">
            <p className="font-display text-[10px] text-text-muted tracking-[0.2em] uppercase mb-2">
              Contact
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <a
                href="mailto:sjs920818@gmail.com"
                className="inline-flex items-center gap-1.5 font-display text-xs tracking-wider text-text-secondary hover:text-accent transition-colors border border-border rounded px-3 py-2"
                aria-label="Email"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 18h-2V9.25L12 13 6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20m0-2H4c-1.11 0-2 .89-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z" />
                </svg>
                Email
              </a>
              <a
                href="https://github.com/SHINJUNGSUN"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-display text-xs tracking-wider text-text-secondary hover:text-accent transition-colors border border-border rounded px-3 py-2"
                aria-label="GitHub"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </a>
              <a
                href="https://deep-thought.space"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-display text-xs tracking-wider text-text-secondary hover:text-accent transition-colors border border-border rounded px-3 py-2"
                aria-label="Blog"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
                Blog
              </a>
            </div>
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
