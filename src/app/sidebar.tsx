"use client";
import "./globals.css";
import "./sidebar.css";
import { usePathname } from "next/navigation";
import React from "react";
import {AccountIcon, AppIcon, LogoutIcon} from "@/app/icons";

export default function Sidebar() {
    const pathName = usePathname();
    return (
        <div className={"sidebar"}>
            <img src="/logo-placeholder-png-2.png" alt="logo" />
            <SidebarLink iconPath="/accountIcon"  path="/account" name={"Account"}/>
            <a className={"logout"} href={"/"} onClick={logout}>
                <LogoutIcon />
            </a>
        </div>
    )
}


const icons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    "/accountIcon": AccountIcon,
}

type SidebarLinkProps = {
    iconPath: string;
    name: string;
    path: string;
}

function SidebarLink({iconPath, path, name} : SidebarLinkProps) {
    const Icon = icons[iconPath];
    const pathname = usePathname();

    return (
        <a className={`${name} sidebarLink`} id={pathname === path ? "selected" : ""} href={path}>
            {Icon && <Icon className="icon" />}
            <p>{name}</p>
        </a>
    )
}

function logout() {
    localStorage.clear();
}