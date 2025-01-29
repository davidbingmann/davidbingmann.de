from fasthtml.common import *
from fasthtml.js import HighlightJS
from markdown_it import MarkdownIt
import pathlib
from fh_bootstrap import bst_hdrs, Container, Image, Icon, ContainerT

app, rt = fast_app(static_dirs=["./assets"])


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
)

def load_main_page():
    return (
        Head(headers),
        Title("David Bingmann"),
        Container(
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
            cls="profile-container"


        )
    )


@rt("/")
def main_page():
    return load_main_page()

serve()