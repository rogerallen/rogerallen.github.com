## [rogerallen.github.io](http://rogerallen.github.io)

My blog based on
[https://github.com/plusjade/jekyll-bootstrap](https://github.com/plusjade/jekyll-bootstrap)
and
[https://github.com/kevinxueliang/jb-svbtle](https://github.com/kevinxueliang/jb-svbtle)
along with some changes of my own.

## Update 2020-07-26

Setting up on Ubuntu 16.04 after a long hiatus.  It's always so painful transferring this to a new 
computer since I don't really use Jekyll or Ruby for anything else.

Got some hints from here: https://www.digitalocean.com/community/tutorials/how-to-set-up-a-jekyll-development-site-on-ubuntu-16-04
```
sudo apt-get install ruby ruby-dev make build-essential
vi ~/.bashrc

  # ruby & jekyll exports
  export GEM_HOME=$HOME/gems
  export PATH=$HOME/gems/bin:$PATH
source ~/.bashrc
gem install jekyll bundler
```

Of course this won't work out of the box!
```
gem install jekyll
ERROR:  Error installing jekyll:
        jekyll-sass-converter requires Ruby version >= 2.4.0.
```

So, let's update our ruby... Apparently rbenv is the way to keep ruby versions sane...
So says https://gorails.com/setup/ubuntu/16.04#ruby-rbenv
```
cd
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
exec $SHELL

git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
echo 'export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"' >> ~/.bashrc
exec $SHELL

rbenv install 2.7.1
rbenv global 2.7.1
ruby -v
gem install jekyll bundler
```

Oops, needed to update `markdown: kramdown` in `_config.yml` and that broke all image links.  

I'm not positive, but I think that I needed an update to jb-svbtle.
`yes | rake theme:install git="https://github.com/kevinxueliang/jb-svbtle.git"`
and a fix to `ASSET_PATH : /assets/themes/jb-svbtle`

Sends to port 4000 and now seems to work. *Whew!*
`jekyll serve`

## License
[MIT](http://opensource.org/licenses/MIT)
