# 🔐 Self-Hosted VPN Setup Guide

Complete guide to setting up your own VPN server using WireGuard on a VPS.

## 📋 What You'll Need

### 1. VPS Provider (Choose One)
- **DigitalOcean** - $6/month (1GB RAM, recommended)
- **Vultr** - $5/month (1GB RAM)
- **Linode** - $5/month (1GB RAM)
- **AWS Lightsail** - $3.50/month (512MB RAM)
- **Hetzner** - €4.51/month (~$5)

### 2. Requirements
- SSH access to your VPS
- Ubuntu 22.04 or Debian 11+ server
- Public IP address (provided by VPS)
- Domain name (optional, but recommended)

## 🚀 Step-by-Step Setup

### Step 1: Get a VPS

#### Recommended: DigitalOcean
1. Sign up at https://www.digitalocean.com
2. Get $200 credit for 60 days (new users)
3. Create a Droplet:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic ($6/month - 1GB RAM)
   - **Datacenter:** Choose closest to your country OR the country you want to appear from
   - **Authentication:** SSH key (recommended) or password

#### Alternative: Vultr
1. Sign up at https://www.vultr.com
2. Deploy New Server:
   - **Server Type:** Cloud Compute
   - **Location:** Choose strategically
   - **Server Image:** Ubuntu 22.04 x64
   - **Server Size:** $5/month (1GB RAM)

### Step 2: Connect to Your VPS

**On Windows:**
```bash
# Using PowerShell or CMD
ssh root@YOUR_SERVER_IP
```

**On Mac/Linux:**
```bash
ssh root@YOUR_SERVER_IP
```

Replace `YOUR_SERVER_IP` with the IP address from your VPS provider.

### Step 3: Install WireGuard (Automated Script)

Copy and run this one-line installer:

```bash
wget https://git.io/wireguard -O wireguard-install.sh && bash wireguard-install.sh
```

**Follow the prompts:**
1. **IPv4/IPv6:** Press Enter (use default)
2. **Port:** Press Enter (use default 51820)
3. **First client name:** Enter your device name (e.g., "my-laptop")
4. **DNS:** Choose option 1 (Cloudflare - fastest and private)

The script will:
- Install WireGuard
- Configure the server
- Generate client configuration
- Set up firewall rules
- Enable IP forwarding

### Step 4: Get Your Client Configuration

After installation, you'll see a QR code and a configuration file.

**Save the configuration:**
```bash
cat /root/wg0-client-my-laptop.conf
```

Copy the entire output - you'll need this!

## 📱 Client Setup

### Windows
1. Download WireGuard: https://www.wireguard.com/install/
2. Open WireGuard app
3. Click "Add Tunnel" → "Add empty tunnel"
4. Paste your configuration
5. Click "Activate"

### Mac
1. Download from App Store: "WireGuard"
2. Open app
3. Click "+" → "Add empty tunnel"
4. Paste configuration
5. Toggle to connect

### Android
1. Install "WireGuard" from Play Store
2. Open app
3. Tap "+" → "Create from file or archive"
4. Either scan the QR code or import the config file
5. Tap to connect

### iOS/iPhone
1. Install "WireGuard" from App Store
2. Open app
3. Tap "+" → "Create from QR code"
4. Scan the QR code displayed on your server
5. Tap to connect

## 🧪 Testing Your VPN

### 1. Check Your IP Address

**Before connecting:**
```
Visit: https://whatismyipaddress.com/
Note your current IP
```

**After connecting to VPN:**
```
Visit: https://whatismyipaddress.com/
You should see your VPS IP and location!
```

### 2. Test Your Web Proxy Through VPN

1. Connect to your VPN
2. Open your web proxy: `http://localhost:3000`
3. Try accessing blocked websites
4. Your traffic is now routed through the VPS IP!

## 🔧 Advanced Configuration

### Add More Clients

```bash
bash wireguard-install.sh
```
Choose option 1 to add a new client.

### Remove a Client

```bash
bash wireguard-install.sh
```
Choose option 2 and select the client to remove.

### Check VPN Status

```bash
wg show
```

### View Connected Clients

```bash
wg show wg0
```

## 🛡️ Security Hardening

### 1. Setup UFW Firewall

```bash
ufw allow 22/tcp        # SSH
ufw allow 51820/udp     # WireGuard
ufw enable
```

### 2. Disable Root Login

```bash
# Create a new user
adduser yourusername
usermod -aG sudo yourusername

# Test sudo access
su - yourusername
sudo ls

# Disable root login (after testing!)
nano /etc/ssh/sshd_config
# Change: PermitRootLogin yes → PermitRootLogin no
systemctl restart sshd
```

### 3. Enable Automatic Updates

```bash
apt install unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

## 💰 Cost Breakdown

### Monthly Costs
- **VPS:** $5-6/month
- **Bandwidth:** Usually unlimited (check your plan)
- **Domain (optional):** $1-2/month

### One-Time Costs
- **VPS Setup:** $0 (many providers offer free credit)
- **Domain:** $10-15/year (optional)

### Total: ~$5-6/month

## 🌍 Best Server Locations

### For Indian Users Bypassing Blocks:
1. **Singapore** - Lowest latency, fast speeds
2. **Japan (Tokyo)** - Good speeds, reliable
3. **Netherlands (Amsterdam)** - Many services hosted here
4. **United States (New York)** - Access US content
5. **Germany (Frankfurt)** - Privacy-friendly laws

### Choosing Location Strategy:
- **For Speed:** Choose nearest location
- **For Content:** Choose where the content is hosted
- **For Privacy:** Choose privacy-friendly countries (Switzerland, Iceland, Netherlands)

## 📊 Performance Expectations

### With $5-6/month VPS:
- **Speed:** 100-500 Mbps (depending on location)
- **Latency:** +20-100ms added latency
- **Concurrent Users:** 5-10 devices
- **Success Rate:** 60-70% for blocked sites

### Advantages Over Simple Proxy:
- ✅ All traffic encrypted
- ✅ Works for all apps (not just browsers)
- ✅ Better success rate
- ✅ Faster than HTTP proxy
- ✅ More private

## 🔍 Troubleshooting

### VPN Won't Connect
```bash
# Check WireGuard status
systemctl status wg-quick@wg0

# Restart WireGuard
systemctl restart wg-quick@wg0

# Check firewall
ufw status
```

### Slow Speeds
- Try different VPS location
- Upgrade VPS plan (more bandwidth)
- Check your internet connection

### Can't Access Certain Sites
- Some sites block VPS IPs
- Consider residential proxy for those specific sites
- Try different VPS provider

## 🆚 VPN vs Your Web Proxy

### When to Use VPN:
- All device traffic needs protection
- Gaming, streaming, downloads
- Mobile apps
- Better privacy

### When to Use Your Web Proxy:
- Testing specific websites
- Sharing access (web interface)
- Learning about proxies
- When VPN is blocked

### Best Approach: Use Both!
- **VPN:** For general browsing and privacy
- **Web Proxy:** For specific testing or when VPN doesn't work

## 🎯 Next Steps

1. ✅ Choose a VPS provider
2. ✅ Deploy Ubuntu server
3. ✅ Run WireGuard installation script
4. ✅ Install WireGuard client on your devices
5. ✅ Test with your web proxy app
6. ✅ Enjoy unrestricted access!

## 💡 Pro Tips

1. **Multiple Locations:** Deploy VPS in multiple regions, use whichever works best
2. **Backup:** Keep your WireGuard configs backed up safely
3. **Monitoring:** Check your VPS monthly usage to avoid overage charges
4. **Updates:** Run `apt update && apt upgrade` monthly
5. **Kill Switch:** Enable in WireGuard client to prevent leaks

## 📚 Additional Resources

- WireGuard Official: https://www.wireguard.com/
- DigitalOcean Tutorials: https://www.digitalocean.com/community/tutorials
- /r/WireGuard on Reddit: Community support
- WireGuard Documentation: https://www.wireguard.com/quickstart/

---

**Remember:** This VPN is for personal use. Respect local laws and website terms of service.
