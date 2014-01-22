# for local use
LPATH := /usr/local/opt/ruby/bin:$(PATH)

serve:
	env PATH=$(LPATH) jekyll serve

serveall:
	env PATH=$(LPATH) jekyll serve --drafts
