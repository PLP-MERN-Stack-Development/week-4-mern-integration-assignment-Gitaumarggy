import Navbar from "./Navbar";

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ padding: "2rem" }}>{children}</main>
  </>
);

export default Layout;