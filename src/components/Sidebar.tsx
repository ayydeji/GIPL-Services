"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState } from "react";
import { navTree, type NavItem } from "@/lib/site-config";
import { BookServiceButton } from "@/components/BookServiceButton";
import { FreeConsultationButton } from "@/components/FreeConsultationButton";
import {
  headerLoad,
  mobileMenuItem,
  mobileMenuPanel,
  mobileMenuStagger,
  sidebarDrawer,
  sidebarScrim,
} from "@/lib/motion";

const SECTION_IDS = navTree.map((item) => item.href.slice(1));

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`shrink-0 text-espresso-900/45 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavTreeList({
  idPrefix,
  activeId,
  openParent,
  onToggleParent,
  onNavigate,
}: {
  idPrefix: string;
  activeId: string | null;
  openParent: string | null;
  onToggleParent: (id: string) => void;
  onNavigate: (item: NavItem, child: { label: string; href: string } | null, event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {navTree.map((item) => {
        const id = item.href.slice(1);
        const isActive = activeId === id;
        const hasChildren = Boolean(item.children?.length);
        const isOpen = hasChildren && openParent === id;
        const submenuId = `${idPrefix}submenu-${id}`;

        return (
          <li key={item.href}>
            <div className="group flex items-center rounded-lg pr-1 transition-colors hover:bg-espresso-900/3">
              <a
                href={item.href}
                onClick={(event) => onNavigate(item, null, event)}
                className="flex flex-1 items-center gap-3 px-3 py-2.5"
              >
                <span
                  aria-hidden="true"
                  className={`h-5 w-0.5 shrink-0 rounded-full transition-all duration-300 ${
                    isActive ? "bg-bronze-500" : "bg-espresso-900/15"
                  }`}
                />
                <span
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive ? "text-espresso-900" : "text-espresso-900/60"
                  }`}
                >
                  {item.label}
                </span>
              </a>

              {hasChildren && (
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={submenuId}
                  aria-label={`Toggle ${item.label} submenu`}
                  onClick={() => onToggleParent(id)}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full"
                >
                  <ChevronIcon open={isOpen} />
                </button>
              )}
            </div>

            {hasChildren && (
              <AnimatePresence initial={false}>
                {isOpen && (
                  <m.div
                    key={submenuId}
                    id={submenuId}
                    variants={mobileMenuPanel}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden"
                  >
                    <m.ul
                      className="flex flex-col gap-0.5 py-1 pl-8"
                      variants={mobileMenuStagger}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {item.children!.map((child) => (
                        <m.li key={child.href} variants={mobileMenuItem}>
                          <a
                            href={child.href}
                            onClick={(event) => onNavigate(item, child, event)}
                            className="block rounded-lg px-3 py-2 text-sm text-espresso-900/55 transition-colors hover:bg-espresso-900/3 hover:text-espresso-900"
                          >
                            {child.label}
                          </a>
                        </m.li>
                      ))}
                    </m.ul>
                  </m.div>
                )}
              </AnimatePresence>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openParent, setOpenParent] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", open);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        const id = topmost.target.id;
        setActiveId(id);
        const item = navTree.find((entry) => entry.href.slice(1) === id);
        if (item?.children?.length) setOpenParent(id);
      },
      { threshold: 0, rootMargin: "-42% 0px -50% 0px" },
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  function toggleParent(id: string) {
    setOpenParent((current) => (current === id ? null : id));
  }

  function handleNavigate() {
    setOpen(false);
  }

  return (
    <>
      <div className="site-nav-bar fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between bg-paper/90 px-5 backdrop-blur-md sm:hidden">
        <span className="text-xl font-bold uppercase tracking-[-0.02em] text-espresso-900">
          GIPL
        </span>
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col items-center justify-center gap-[5px] w-8 h-8 cursor-pointer"
        >
          <m.span
            className="block h-px w-5 bg-espresso-900 origin-center"
            animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          />
          <m.span
            className="block h-px w-5 bg-espresso-900"
            animate={open ? { opacity: 0, scaleX: 0.6 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          />
          <m.span
            className="block h-px w-5 bg-espresso-900 origin-center"
            animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <m.div
            key="sidebar-scrim"
            className="fixed inset-0 z-40 bg-espresso-900/40 sm:hidden"
            variants={sidebarScrim}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {open && (
          <m.nav
            key="mobile-nav"
            aria-label="Primary"
            className="site-nav fixed inset-y-0 left-0 z-50 flex w-[min(18rem,82vw)] flex-col justify-center bg-paper shadow-xl sm:hidden"
            variants={sidebarDrawer}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="max-h-full overflow-y-auto px-3 py-4">
              <NavTreeList
                idPrefix="mobile-"
                activeId={activeId}
                openParent={openParent}
                onToggleParent={toggleParent}
                onNavigate={handleNavigate}
              />

              <div className="mt-6 flex flex-col gap-3 border-t border-espresso-900/10 px-3 pt-6">
                <BookServiceButton
                  serviceKey="epc"
                  size="lg"
                  fullWidth
                  expandInline
                  menuAlign="left"
                />
                <FreeConsultationButton size="lg" />
              </div>
            </div>
          </m.nav>
        )}
      </AnimatePresence>

      <m.nav
        aria-label="Primary"
        className="site-nav fixed inset-y-0 left-0 z-50 hidden w-[var(--sidebar-w)] flex-col justify-center bg-paper sm:flex"
        variants={headerLoad}
        initial="hidden"
        animate="visible"
      >
        <div className="max-h-full overflow-y-auto px-3 py-4">
          <NavTreeList
            idPrefix="desktop-"
            activeId={activeId}
            openParent={openParent}
            onToggleParent={toggleParent}
            onNavigate={handleNavigate}
          />
        </div>
      </m.nav>
    </>
  );
}
