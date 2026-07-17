import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useUIStore } from '@/store/ui';
import { cn } from '@/utils/helpers';

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
};

export default function NavGroup({ icon: Icon, label, children, sidebarOpen }) {
  const expandedGroups = useUIStore((s) => s.expandedGroups);
  const toggleGroup = useUIStore((s) => s.toggleGroup);
  const isExpanded = expandedGroups.includes(label);

  if (!sidebarOpen) {
    return (
      <div className="group relative flex justify-center py-3">
        <div className="text-[var(--sidebar-nav-text)] group-hover:text-[var(--sidebar-nav-text-hover)] transition-colors duration-200">
          <Icon size={18} />
        </div>
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-[var(--bg-sidebar)] text-[var(--text-inverse)] text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 shadow-lg border border-white/10">
          {label}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => toggleGroup(label)}
        className={cn(
          'flex items-center gap-3 w-full text-sm transition-all duration-200 px-5 py-2.5',
          'text-[var(--sidebar-nav-text)] hover:text-[var(--sidebar-nav-text-hover)] hover:bg-[var(--sidebar-nav-bg-hover)]'
        )}
      >
        <Icon size={18} />
        <span className="flex-1 text-left">{label}</span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/40"
        >
          <ChevronDown size={14} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="subnav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <motion.div
              variants={{
                visible: { transition: { staggerChildren: 0.04 } },
              }}
              initial="hidden"
              animate="visible"
              className="border-l border-white/10 ml-6"
            >
              {children.map((child, idx) => (
                <motion.div key={child.to || idx} variants={itemVariants} transition={{ duration: 0.15 }}>
                  <NavLink
                    to={child.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 pl-4 pr-5 py-2 text-xs transition-all duration-200',
                        isActive
                          ? 'text-white bg-[var(--sidebar-nav-bg-active)] border-l-[3px] border-[var(--sidebar-nav-border-active)] -ml-px'
                          : 'text-[var(--sidebar-nav-text)] hover:text-[var(--sidebar-nav-text-hover)] hover:bg-[var(--sidebar-nav-bg-hover)]'
                      )
                    }
                  >
                    {child.label}
                  </NavLink>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
