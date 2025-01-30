from fasthtml.common import *
from fasthtml.js import HighlightJS
from markdown_it import MarkdownIt
from mdit_py_plugins.front_matter import front_matter_plugin
from mdit_py_plugins.footnote import footnote_plugin
import pathlib
from fh_bootstrap import bst_hdrs, Container, Image, Icon, ContainerT

app, rt = fast_app(static_dirs=["./assets"])

md = md = (
    MarkdownIt("commonmark")
    .enable("table")  # Tabellen aktivieren (falls benötigt)
    .use(front_matter_plugin)  # Front Matter aktivieren
    .use(footnote_plugin)  # Fußnoten aktivieren
)

fa_cfurl = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0"
headers = (
    Link(href=f"{fa_cfurl}/css/all.min.css", rel="stylesheet"),
    Link(
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css",
        rel="stylesheet",
        type="text/css",
    ),
    StyleX("assets/styles.css"),
    Script(src="https://unpkg.com/htmx.org@next/dist/htmx.min.js"),
    *HighlightJS(langs=["python", "html", "yaml", "bash", "sh", "powershell", "dockerfile"], dark="a11y-dark"),
    Favicon("/assets/favicon.ico", "/assets/favicon.ico"),
    Meta(name="viewport", content="width=device-width, initial-scale=1, viewport-fit=cover"),
    Meta(charset="utf-8"),
    Script(src="assets/toggleMenu.js"),
)

def render_markdown(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    return md.render(content)

@rt("/")
def main_page():
    return (
        Head(headers),
        Title("David Bingmann"),
        Container(
            Div(
                Div(
                    I(cls="fas fa-bars hamburger-icon", onclick="toggleMenu()"),
                ),
                    Div(
                        A("Projects", href="/projects", cls="menu-item"),
                        A("Resume", href="/resume", cls="menu-item"),
                        cls="dropdown-menu"
                    ),
                    cls="menu-container"
                ),
            Div(
                Image("assets/profile_picture.jpeg"),
                cls="profile-picture-wrapper"
            ),

            Div(H1("David Bingmann"), cls="profile-name"),

            Div(
                A(I(cls="fab fa-github"), href="https://github.com/davidbingmann", cls="github-icon", target="_blank"),
                A(I(cls="fab fa-x-twitter"), href="https://x.com/DavidBingmann2", cls="x-icon", target="_blank"),
                A(I(cls="fab fa-bluesky"), href="https://bsky.app/profile/davidbingmann.de", cls="bluesky-icon", target="_blank"),
                A(I(cls="fab fa-linkedin"), href="https://www.linkedin.com/in/david-bingmann-13b897293/", cls="linkedin-icon", target="_blank"),
                cls="social-container"
            ),

            Div(NotStr(render_markdown("assets/about_me.md")), cls="about-me-container"),
            Div(
                A("Click here to view the website's code", href="https://github.com/davidbingmann/davidbingmann.de", target="_blank", cls="code-link"),
                cls="footer"
            ),
            cls="profile-container")
        ),


@rt("/projects")
def projects_page():
    return (
        Head(headers),
        Title("Projects - David Bingmann"),
        Container(
            Div(
                A("Home", href="/", cls="btn btn-primary"),
                H1("Projects", cls="projects-title text-center"),
                Div(
                    P("nothing to see here yet", cls="empty-text text-center"),
                    cls="empty-container d-flex justify-content-center align-items-center"
                ),
                cls="projects-container"
            )
        )
    )


@rt("/resume") 
def resume_page():
    return (
        Head(headers),
        Title("Resume - David Bingmann"),
        Container(
            Div(
                A("Home", href="/", cls="btn btn-primary"),
                H1("Resume", cls="projects-title text-center"),
                Div(
                    P("nothing to see here yet", cls="empty-text text-center"),
                    cls="empty-container d-flex justify-content-center align-items-center"
                ),
                cls="projects-container"
            )
        )
    )

serve()