import { Nav, NavLink } from "../components/Nav";

export const dynamic = "force-dynamic";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Nav>
        <NavLink href="/">Home</NavLink>
        <NavLink href="/services">Services</NavLink>
        <NavLink href="/orders">Sales</NavLink>
      </Nav>
      <div className="container my-6 mx-auto">{children}</div>
    </>
  );
}
