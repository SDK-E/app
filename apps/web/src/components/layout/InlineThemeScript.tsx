"use client";

interface InlineThemeScriptProps {
  initialTheme?: string;
}

export function InlineThemeScript({ initialTheme = "system" }: InlineThemeScriptProps) {
  const script = `(function(){try{var t=localStorage.getItem("theme");if(!t){var c=document.cookie.split("; ").find(function(e){return e.startsWith("preferredTheme=")});if(c){t=c.split("=")[1];}else{t="${initialTheme}";}}if(t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}document.documentElement.dataset.theme=t;}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
