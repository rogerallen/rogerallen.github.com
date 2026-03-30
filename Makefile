# for local use.  e.g. make serve HOST=YOUR_IP_ADDRESS
HOST ?= 127.0.0.1

serve:
	bundle exec jekyll serve --watch --host $(HOST)

serveall:
	bundle exec jekyll serve --watch --drafts --host $(HOST)
