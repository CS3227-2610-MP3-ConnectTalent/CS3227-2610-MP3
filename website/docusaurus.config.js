import { themes as prismThemes } from "prism-react-renderer";
import remarkRepositoryLinks from "./plugins/remark-repository-links.js";

const repository = "CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "ConnectTalent",
  tagline: "Careers portal · User and Developer Guides",
  url: "https://cs3227-2610-mp3-connecttalent.github.io",
  baseUrl: "/CS3227-2610-MP3/",
  trailingSlash: true,
  organizationName: "CS3227-2610-MP3-ConnectTalent",
  projectName: "CS3227-2610-MP3",
  onBrokenLinks: "throw",
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "throw",
      onBrokenMarkdownImages: "throw",
    },
  },
  themes: ["@docusaurus/theme-mermaid"],
  presets: [
    [
      "classic",
      {
        docs: {
          path: "..",
          include: [
            "docs/overview.md",
            "docs/UserGuide.md",
            "docs/DeveloperGuide.md",
            "docs/Reflections.md",
            "docs/PaulReflections.md",
            "docs/JohnReflections.md",
          ],
          routeBasePath: "/",
          sidebarPath: "./sidebars.js",
          editUrl: `https://github.com/${repository}/edit/develop/`,
          beforeDefaultRemarkPlugins: [
            [
              remarkRepositoryLinks,
              {
                repositoryUrl: `https://github.com/${repository}`,
                revision: process.env.GITHUB_SHA ?? "develop",
              },
            ],
          ],
        },
        blog: false,
        theme: { customCss: "./src/css/custom.css" },
      },
    ],
  ],
  themeConfig: {
    navbar: {
      title: "ConnectTalent",
      items: [
        { to: "/", label: "Overview", position: "left" },
        {
          type: "doc",
          docId: "docs/UserGuide",
          label: "User Guide",
          position: "left",
        },
        {
          type: "doc",
          docId: "docs/DeveloperGuide",
          label: "Developer Guide",
          position: "left",
        },
        {
          href: "https://cs3227-mp3.vercel.app/",
          label: "Open application",
          position: "right",
        },
        {
          href: `https://github.com/${repository}`,
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Guides",
          items: [
            { label: "User Guide", to: "/docs/UserGuide" },
            { label: "Developer Guide", to: "/docs/DeveloperGuide" },
            { label: "Reflections", to: "/docs/Reflections" },
          ],
        },
        {
          title: "Project",
          items: [
            {
              label: "Careers application",
              href: "https://cs3227-mp3.vercel.app/",
            },
            {
              label: "Source repository",
              href: `https://github.com/${repository}`,
            },
          ],
        },
      ],
      copyright: "ConnectTalent · CS3227 MP3 · Paul Cheng and John Wong",
    },
    tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
    prism: {
      additionalLanguages: ["bash", "gherkin", "json", "powershell", "sql"],
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
