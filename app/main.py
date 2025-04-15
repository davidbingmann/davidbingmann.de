from fasthtml.common import *
from fasthtml.js import HighlightJS
from markdown_it import MarkdownIt
from mdit_py_plugins.front_matter import front_matter_plugin
from mdit_py_plugins.footnote import footnote_plugin
from fh_bootstrap import Container, Image

app, rt = fast_app(static_dirs=["./assets"])

md = MarkdownIt("commonmark").enable("table").use(front_matter_plugin).use(footnote_plugin)

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
    Script(src="assets/footer.js"),
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
                    cls="dropdown-menu",
                ),
                cls="menu-container",
            ),
            Div(Image("assets/profile_picture.jpeg"), cls="profile-picture-wrapper"),
            Div(H1("David Bingmann"), cls="profile-name"),
            Div(
                A(
                    I(cls="fab fa-github"),
                    href="https://github.com/davidbingmann",
                    cls="github-icon",
                    target="_blank",
                ),
                A(
                    I(cls="fab fa-bluesky"),
                    href="https://bsky.app/profile/davidbingmann.de",
                    cls="bluesky-icon",
                    target="_blank",
                ),
                A(
                    I(cls="fab fa-linkedin"),
                    href="https://www.linkedin.com/in/david-bingmann-13b897293/",
                    cls="linkedin-icon",
                    target="_blank",
                ),
                A(
                    I(cls="fab fa-x-twitter"),
                    href="https://x.com/DavidBingmann2",
                    cls="x-icon",
                    target="_blank",
                ),
                cls="social-container",
            ),
            Div(NotStr(render_markdown("assets/about_me.md")), cls="about-me-container"),
            cls="profile-container",
        ),
    )


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
                    P("Nothing to see here yet!", cls="empty-text text-center"),
                    cls="empty-container d-flex justify-content-center align-items-center",
                ),
                cls="projects-container",
            )
        ),
    )


@rt("/resume")
def resume_page():
    timeline_items = [
        {
            "year": "October 2024",
            "title": "Research Assistant at DFKI",
            "description": "Start of my part-time job at the German Research Center for Artificial Intelligence (DFKI) alongside my studies",
        },
        {
            "year": "October 2024",
            "title": "Start of my Bachelor's degree",
            "description": "Start of my Bachelor's degree: Artificial Intelligence and Data Science at the University of Applied Science in Trier",
        },
        {
            "year": "May 2024",
            "title": "Internship at Tesla Automation",
            "description": "Internship from 27/05/2024 until 07/06/2024 in Controls Engineering",
        },
        {
            "year": "March 2024",
            "title": "Abitur",
            "description": "Finished my Abitur at the Staatliches Eifelgymnasium in Neuerburg",
        },
    ]

    return (
        Head(*headers, StyleX("assets/timeline.css")),
        Title("Resume - David Bingmann"),
        Container(
            Div(
                A("Home", href="/", cls="btn btn-primary"),
                H1("Resume", cls="projects-title text-center"),
                Div(
                    Div(
                        *[
                            Div(
                                Div(
                                    Div(
                                        H3(item["title"], cls="timeline-title"),
                                        P(item["year"], cls="timeline-year"),
                                        P(item["description"], cls="timeline-description"),
                                    ),
                                    cls="timeline-content",
                                ),
                                cls="timeline-item",
                                style=f"--item-index: {i}",
                            )
                            for i, item in enumerate(timeline_items)
                        ],
                        cls="timeline",
                    ),
                    cls="resume-container",
                ),
            )
        ),
    )


serve() #start of the website
