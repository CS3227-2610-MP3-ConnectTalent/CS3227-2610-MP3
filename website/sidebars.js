/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  guides: [
    "docs/overview",
    {
      type: "category",
      label: "User Guide",
      link: { type: "doc", id: "docs/UserGuide" },
      collapsed: false,
      items: [
        {
          type: "link",
          label: "Getting started",
          href: "/docs/UserGuide/#1-getting-started",
        },
        {
          type: "link",
          label: "Applicant workflow",
          href: "/docs/UserGuide/#3-applicant-workflow",
        },
        {
          type: "link",
          label: "HR workflow",
          href: "/docs/UserGuide/#4-hr-workflow",
        },
        {
          type: "link",
          label: "Troubleshooting and FAQ",
          href: "/docs/UserGuide/#7-troubleshooting-and-faq",
        },
      ],
    },
    {
      type: "category",
      label: "Developer Guide",
      link: { type: "doc", id: "docs/DeveloperGuide" },
      collapsed: false,
      items: [
        {
          type: "link",
          label: "Local setup",
          href: "/docs/DeveloperGuide/#2-getting-started",
        },
        {
          type: "link",
          label: "Product and specifications",
          href: "/docs/DeveloperGuide/#3-product-definition",
        },
        {
          type: "link",
          label: "Architecture and design",
          href: "/docs/DeveloperGuide/#5-architecture-and-data-design",
        },
        {
          type: "link",
          label: "Development process",
          href: "/docs/DeveloperGuide/#6-software-engineering-process",
        },
        {
          type: "link",
          label: "Testing strategy",
          href: "/docs/DeveloperGuide/#7-testing-strategy",
        },
        {
          type: "link",
          label: "Deployment and release",
          href: "/docs/DeveloperGuide/#9-deployment-and-release",
        },
      ],
    },
    {
      type: "category",
      label: "Reflections",
      link: { type: "doc", id: "docs/Reflections" },
      collapsed: true,
      items: [
        { type: "doc", id: "docs/PaulReflections", label: "Paul Cheng" },
        { type: "doc", id: "docs/JohnReflections", label: "John Wong" },
      ],
    },
  ],
};

export default sidebars;
