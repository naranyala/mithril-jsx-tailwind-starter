import m from "mithril";

const Layout = {
  view: ({ children }) => {
    const menu = [
      { label: "home", link: "/" },
      { label: "another-route", link: "/another-route" },
      { label: "not-found", link: "/not-found" },
    ];

    return (
      <div>
        <nav class="flex gap-4 w-full justify-center items-center mt-12">
          {menu.map((item) => (
            <div onclick={() => m.route.set(item.link)} class="hover:underline cursor-pointer">
              {item.label}
            </div>
          ))}
        </nav>
        <main class="border-2 rounded-xl m-4 p-4">{children}</main>
      </div>
    );
  },
};

export default Layout
