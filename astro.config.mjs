import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import icon from "astro-icon";

export default defineConfig({
  integrations: [
    [
      starlight({
        customCss: ["./src/styles.css"],
        title: "Andrey Sobolev Blog (haiodo)",
        favicon: "/favicon.ico",
        components: {
          // override default 'SocialIcons' component
          SocialIcons: "./src/components/CustomSocialIcons.astro",
        },
        sidebar: [
          {
            label: "Blog",
            collapsed: false,
            items: [
              {
                label: "Daily activities",
                collapsed: false,
                items: [
                  {
                    label: 'October',
                    collapsed: true,
                    items: [
                      {label: 'October 13', link: '/daily/2025/oct/13'},
                      {label: 'October 14', link: '/daily/2025/oct/14'},
                      {label: 'October 15', link: '/daily/2025/oct/15'},
                      {label: 'October 16', link: '/daily/2025/oct/16'},
                      {label: 'October 17', link: '/daily/2025/oct/17'},
                      {label: 'October 20', link: '/daily/2025/oct/20'},
                      {label: 'October 21', link: '/daily/2025/oct/21'},
                      {label: 'October 24', link: '/daily/2025/oct/24'},
                      {label: 'October 27', link: '/daily/2025/oct/27'},
                      {label: 'October 28', link: '/daily/2025/oct/28'},
                      {label: 'October 29', link: '/daily/2025/oct/29'},
                      {label: 'October 30', link: '/daily/2025/oct/30'},
                      {label: 'October 31', link: '/daily/2025/oct/31'},
                    ]
                  },
                  {
                    label: 'November',
                    items: [
                      {label: 'November 7', link: '/daily/2025/nov/07'},
                      {label: 'November 10', link: '/daily/2025/nov/10'},
                    ]
                  }
                ]
              },
              {
                label: "Posts",
                link: "/posts/overview",
              }
            ],
          },
          {
            label: "Projects",
            items: [
              {
                label: "Tenniarb",
                link: "/projects/tenniarb/overview",
              },
              {
                label: "Huly",
                link: "/projects/huly/overview",
              },
              {
                label: "RCPTT",
                link: "/projects/rcptt",
              },
              {
                label: "DLTK",
                link: "/projects/dltk",
              }
            ],
          }
        ],
      }),
    ],
    [icon()],
  ],
  image: {
    service: {
      config: {
        limitInputPixels: false,
      },
    },
  },
});
