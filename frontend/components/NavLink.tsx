'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ComponentProps, forwardRef } from 'react';

type LinkProps = ComponentProps<typeof Link>;

interface NavLinkProps extends Omit<LinkProps, 'className'> {
  className?: string | ((props: { isActive: boolean }) => string);
  activeClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, href, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    let computedClassName = '';
    if (typeof className === 'function') {
      computedClassName = className({ isActive });
    } else {
      computedClassName = cn(className, isActive && activeClassName);
    }

    return (
      <Link ref={ref} href={href} className={computedClassName} {...props} />
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };
