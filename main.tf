terraform {
  required_version = ">= 1.0.0"
}

resource "digitalocean_droplet" "k6client" {
  count = 3

  image      = "ubuntu-22-10-x64"
  name       = "k6client"
  region     = "nyc1"
  size       = "s-2vcpu-4gb"
  ssh_keys   = [data.digitalocean_ssh_key.do.id]
  monitoring = true

  connection {
    host        = self.ipv4_address
    user        = "root"
    type        = "ssh"
    private_key = file(var.pvt_key)
    timeout     = "2m"
  }


  provisioner "remote-exec" {
    inline = [
      "sudo apt-get update",
      "sudo snap install k6",
      "git clone https://github.com/david-wiles/w10k-k6-clients.git"
    ]
  }
}

resource "digitalocean_domain" "default" {
  count = 3

  name       = format("k6client-%d.%s", count.index, var.domain)
  ip_address = digitalocean_droplet.k6client[count.index].ipv4_address
}

