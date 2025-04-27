'use client';

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
}

export function SideNav() {
    
    const navItems: NavItem[] = [
        
    ];

    return (
        <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    {/* Assuming Logo might be used here, re-add if needed */}
                    <span className="font-semibold">CU Portal</span>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {/* Commenting out NavLink usage as component is not found */}
                        {/* {navItems.map((item) => (
                            <NavLink key={item.href} href={item.href} icon={item.icon}>
                                {item.label}
                            </NavLink>
                        ))} */}
                    </nav>
                </div>
                <div className="mt-auto p-4">
                    {/* Commenting out SignOutButton usage as component is not found */}
                    {/* <SignOutButton /> */}
                </div>
            </div>
        </div>
    );
}
