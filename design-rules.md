/_ ==========================================================
TEMA TERANG (LIGHT MODE)
========================================================== _/
:root {
--background: #ffffff;
--foreground: #1a1a1a;
--card: #ffffff;
--card-foreground: #1a1a1a;
--popover: #ffffff;
--popover-foreground: #1a1a1a;
--primary: #1b1b1b;
--primary-foreground: #fafafa;
--secondary: #f5f5f5;
--secondary-foreground: #1a1a1a;
--muted: #f5f5f5;
--muted-foreground: #737373;
--accent: #f5f5f5;
--accent-foreground: #1a1a1a;
--destructive: #1a1a1a;
--destructive-foreground: #ffffff;
--border: #e5e5e5;
--input: #e5e5e5;
--ring: #a1a1a1;
--chart-1: #282828;
--chart-2: #1e1e1e;
--chart-3: #1c1c1c;
--chart-4: #1a1a1a;
--chart-5: #1a1a1a;
--sidebar: #fafafa;
--sidebar-foreground: #1a1a1a;
--sidebar-primary: #1a1a1a;
--sidebar-primary-foreground: #fafafa;
--sidebar-accent: #f5f5f5;
--sidebar-accent-foreground: #1a1a1a;
--sidebar-border: #e5e5e5;
--sidebar-ring: #a1a1a1;

/_ Typography _/
--font-sans: Nunito, ui-sans-serif, sans-serif, system-ui;
--font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;

/_ Styling & Spacing _/
--radius: 0.625rem;
--tracking-normal: 0em;
--spacing: 0.25rem;

/_ Variasi Border Radius (Hasil konversi dari @theme inline) _/
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);

/_ Drop Shadows _/
--shadow-x: 0;
--shadow-y: 1px;
--shadow-blur: 3px;
--shadow-spread: 0px;
--shadow-opacity: 0.1;
--shadow-color: oklch(0 0 0);
--shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
--shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
--shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
--shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
--shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
--shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
--shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
--shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
}

/_ ==========================================================
TEMA GELAP (DARK MODE)
========================================================== _/
.dark {
--background: #1a1a1a;
--foreground: #fafafa;
--card: #1a1a1a;
--card-foreground: #fafafa;
--popover: #262626;
--popover-foreground: #fafafa;
--primary: #e5e5e5;
--primary-foreground: #1a1a1a;
--secondary: #262626;
--secondary-foreground: #fafafa;
--muted: #262626;
--muted-foreground: #a1a1a1;
--accent: #404040;
--accent-foreground: #fafafa;
--destructive: #242424;
--destructive-foreground: #fafafa;
--border: #282828;
--input: #343434;
--ring: #737373;
--chart-1: #282828;
--chart-2: #1e1e1e;
--chart-3: #1c1c1c;
--chart-4: #1a1a1a;
--chart-5: #1a1a1a;
--sidebar: #1a1a1a;
--sidebar-foreground: #fafafa;
--sidebar-primary: #1a1a1a;
--sidebar-primary-foreground: #fafafa;
--sidebar-accent: #262626;
--sidebar-accent-foreground: #fafafa;
--sidebar-border: #282828;
--sidebar-ring: #525252;
}

/_ ==========================================================
BASE & RESET (Pengganti @layer base)
========================================================== _/
_, _::before, _::after {
box-sizing: border-box;
/_ Mengaplikasikan warna border default ke seluruh elemen \*/
border-color: var(--border);
outline-color: var(--ring);
}

body {
margin: 0;
padding: 0;
background-color: var(--background);
color: var(--foreground);
font-family: var(--font-sans);

/_ Transisi smooth saat ganti tema _/
transition: background-color 0.3s ease, color 0.3s ease;
}
