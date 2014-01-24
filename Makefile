# for local use
LPATH := /usr/local/opt/ruby/bin:$(PATH)

serve:
	env PATH=$(LPATH) jekyll serve --watch

serveall:
	env PATH=$(LPATH) jekyll serve --watch --drafts
