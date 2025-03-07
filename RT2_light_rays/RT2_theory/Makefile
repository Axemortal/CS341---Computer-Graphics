
all: theory.html

theory.html: theory.md
	pandoc --toc -o theory.html --template toc-sidebar.html --mathjax=https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js --css=icg_report.css -s theory.md
