import { Users } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, stagger, viewport } from "@/lib/motion";
const team = [
  {
    name: "Mahmoud Nasser",
    role: "Software Engineer & Cybersecurity",
    img: "/Mahmoud.jpeg",
    bio: "developer specialized in full-stack engineering and Cybersecurity.",
  },
  {
    name: "Youssef Alaa",
    role: "Software Engineer",
    img: "/Youssef2.jpeg",
    bio: "backend architecture and building scalable fintech infrastructure.",
  },
  {
    name: "Noran Ahmed",
    role: "Software Engineer & Cybersecurity ",
    img: "",
    bio: "Focused on system integrity, encryption, and protecting financial data from vulnerabilities.",
  },
  {
    name: "Yahya Abdallah",
    role: "Software Engineer",
    img: "",
    bio: "Dedicated to developing seamless user experiences and high-performance system logic.",
  },
  {
    name: "Esraa Akram",
    role: "Software Engineer | Data  & ML",
    img: "",
    bio: "Specialized in data-driven insights and machine learning models for fraud detection.",
  },
];

function AboutTeam() {
  return (
    <section className="relative py-24 bg-secondary/40 dark:bg-secondary/40 overflow-hidden">
      {/* LIGHT BACKGROUND (neutral off-white) */}
      <div className="pointer-events-none absolute inset-0 dark:hidden">
        <div className="absolute inset-0 bg-[#f6f7f8]" />
        <div className="absolute -top-24 left-1/2 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-black/5 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 h-[260px] w-[260px] rounded-full bg-black/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #000 1px, transparent 0)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="container relative mx-auto px-4">
        {/* HEADER */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/40 bg-emerald-50/60 px-3 py-1.5">
            <Users className="h-3 w-3 text-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              The Team
            </span>
          </div>

          <h2 className="mb-4 font-display text-4xl font-bold text-foreground">
            Meet the people behind SecureWallet
          </h2>

          <p className="mx-auto max-w-xl text-muted-foreground">
            A team of fintech veterans, security experts, and design innovators.
          </p>
        </motion.div>

        {/* GRID */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="flex flex-wrap justify-center gap-10 mx-auto max-w-8xl"
        >
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              variants={fadeUp}
              custom={i}
              className="
                group relative w-[210px] sm:w-[230px]
                overflow-hidden rounded-xl
                border border-border bg-card
                transition-all duration-500
                hover:-translate-y-1.5
                hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)]
              "
            >
              {/* IMAGE */}
              <div className="aspect-square w-full overflow-hidden bg-muted relative">
                {member.img ? (
                  <>
                    <img
                      src={member.img}
                      alt={member.name}
                      className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-emerald-50/30 text-emerald-600/50">
                    <div className="relative">
                      <Users className="h-10 w-10 opacity-20" />
                      <div className="absolute inset-0 blur-xl bg-emerald-400/20" />
                    </div>
                    <span className="mt-3 text-[9px] font-bold uppercase tracking-[0.2em]">Awaiting</span>
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-4 text-center">
                <h3 className="font-display text-base font-bold text-foreground transition-colors duration-300 group-hover:text-emerald-600">
                  {member.name}
                </h3>

                <p className="mt-1 text-[11px] font-semibold text-emerald-600/80">
                  {member.role}
                </p>

                <div className="mt-3 h-px w-6 bg-emerald-100 mx-auto transition-all duration-500 group-hover:w-12 group-hover:bg-emerald-300" />

                <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground line-clamp-3">
                  {member.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default AboutTeam;
