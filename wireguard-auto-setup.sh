#!/bin/bash

# WireGuard VPN Auto-Installer
# For Ubuntu 22.04 / Debian 11+
# Run with: sudo bash wireguard-auto-setup.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   WireGuard VPN Auto-Installer        ║"
echo "║   For Bypassing Blocked Websites      ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}" 
   echo "Please run: sudo bash wireguard-auto-setup.sh"
   exit 1
fi

echo -e "${GREEN}✓${NC} Running as root"

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
else
    echo -e "${RED}Cannot detect OS${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Detected OS: $OS $VER"

# Check if WireGuard is already installed
if [ -f /etc/wireguard/wg0.conf ]; then
    echo -e "${YELLOW}⚠${NC}  WireGuard is already installed!"
    echo "What would you like to do?"
    echo "1) Add a new client"
    echo "2) Remove WireGuard"
    echo "3) Show existing config"
    read -p "Choice [1-3]: " choice
    
    case $choice in
        1)
            read -p "Enter client name: " CLIENT_NAME
            cd /etc/wireguard/
            wg genkey | tee ${CLIENT_NAME}_privatekey | wg pubkey > ${CLIENT_NAME}_publickey
            CLIENT_PRIVKEY=$(cat ${CLIENT_NAME}_privatekey)
            CLIENT_PUBKEY=$(cat ${CLIENT_NAME}_publickey)
            
            # Get next available IP
            LAST_IP=$(grep -oP 'AllowedIPs = 10.66.66.\K\d+' wg0.conf | sort -n | tail -1)
            CLIENT_IP=$((LAST_IP + 1))
            
            # Add to server config
            cat >> wg0.conf << EOF

[Peer]
PublicKey = ${CLIENT_PUBKEY}
AllowedIPs = 10.66.66.${CLIENT_IP}/32
EOF
            
            # Create client config
            SERVER_PUBKEY=$(cat publickey)
            SERVER_IP=$(curl -s ifconfig.me)
            
            cat > ${CLIENT_NAME}.conf << EOF
[Interface]
PrivateKey = ${CLIENT_PRIVKEY}
Address = 10.66.66.${CLIENT_IP}/24
DNS = 1.1.1.1

[Peer]
PublicKey = ${SERVER_PUBKEY}
Endpoint = ${SERVER_IP}:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
EOF
            
            systemctl restart wg-quick@wg0
            echo -e "${GREEN}✓${NC} Client ${CLIENT_NAME} added!"
            echo "Configuration saved to: /etc/wireguard/${CLIENT_NAME}.conf"
            cat ${CLIENT_NAME}.conf
            exit 0
            ;;
        2)
            systemctl stop wg-quick@wg0
            systemctl disable wg-quick@wg0
            rm -rf /etc/wireguard/
            echo -e "${GREEN}✓${NC} WireGuard removed"
            exit 0
            ;;
        3)
            echo "Server configuration:"
            cat /etc/wireguard/wg0.conf
            exit 0
            ;;
    esac
fi

# Update system
echo -e "${BLUE}[1/8]${NC} Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

# Install WireGuard
echo -e "${BLUE}[2/8]${NC} Installing WireGuard..."
apt-get install -y wireguard qrencode iptables

# Enable IP forwarding
echo -e "${BLUE}[3/8]${NC} Enabling IP forwarding..."
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
echo "net.ipv6.conf.all.forwarding=1" >> /etc/sysctl.conf
sysctl -p

# Generate server keys
echo -e "${BLUE}[4/8]${NC} Generating server keys..."
cd /etc/wireguard/
umask 077
wg genkey | tee privatekey | wg pubkey > publickey

# Get server public IP
SERVER_PUB_IP=$(curl -s ifconfig.me)
echo -e "${GREEN}✓${NC} Server IP: $SERVER_PUB_IP"

# Get network interface
SERVER_PUB_NIC=$(ip -4 route ls | grep default | grep -Po '(?<=dev )(\S+)' | head -1)
echo -e "${GREEN}✓${NC} Network interface: $SERVER_PUB_NIC"

# Create server config
echo -e "${BLUE}[5/8]${NC} Creating server configuration..."
cat > /etc/wireguard/wg0.conf << EOF
[Interface]
Address = 10.66.66.1/24
ListenPort = 51820
PrivateKey = $(cat privatekey)
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o $SERVER_PUB_NIC -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o $SERVER_PUB_NIC -j MASQUERADE
EOF

# Generate first client
echo -e "${BLUE}[6/8]${NC} Generating client configuration..."
read -p "Enter name for your first client [my-device]: " CLIENT_NAME
CLIENT_NAME=${CLIENT_NAME:-my-device}

wg genkey | tee ${CLIENT_NAME}_privatekey | wg pubkey > ${CLIENT_NAME}_publickey
CLIENT_PRIVKEY=$(cat ${CLIENT_NAME}_privatekey)
CLIENT_PUBKEY=$(cat ${CLIENT_NAME}_publickey)
SERVER_PUBKEY=$(cat publickey)

# Add peer to server config
cat >> /etc/wireguard/wg0.conf << EOF

[Peer]
PublicKey = ${CLIENT_PUBKEY}
AllowedIPs = 10.66.66.2/32
EOF

# Create client config
cat > /etc/wireguard/${CLIENT_NAME}.conf << EOF
[Interface]
PrivateKey = ${CLIENT_PRIVKEY}
Address = 10.66.66.2/24
DNS = 1.1.1.1, 1.0.0.1

[Peer]
PublicKey = ${SERVER_PUBKEY}
Endpoint = ${SERVER_PUB_IP}:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
EOF

# Setup firewall
echo -e "${BLUE}[7/8]${NC} Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 51820/udp
    ufw allow OpenSSH
    echo "y" | ufw enable
else
    iptables -A INPUT -p udp --dport 51820 -j ACCEPT
    iptables-save > /etc/iptables/rules.v4
fi

# Start WireGuard
echo -e "${BLUE}[8/8]${NC} Starting WireGuard service..."
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

# Display success message
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ WireGuard VPN Successfully Setup!  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Server Information:${NC}"
echo "  • Public IP: $SERVER_PUB_IP"
echo "  • VPN Network: 10.66.66.0/24"
echo "  • Port: 51820/UDP"
echo ""
echo -e "${BLUE}Client Configuration:${NC}"
echo "  • Name: ${CLIENT_NAME}"
echo "  • Config file: /etc/wireguard/${CLIENT_NAME}.conf"
echo ""
echo -e "${YELLOW}To view your client configuration:${NC}"
echo "  cat /etc/wireguard/${CLIENT_NAME}.conf"
echo ""
echo -e "${YELLOW}To display QR code (for mobile):${NC}"
echo "  qrencode -t ansiutf8 < /etc/wireguard/${CLIENT_NAME}.conf"
echo ""
echo -e "${YELLOW}To add more clients:${NC}"
echo "  sudo bash $0"
echo ""
echo -e "${GREEN}Your client configuration:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat /etc/wireguard/${CLIENT_NAME}.conf
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}QR Code for mobile devices:${NC}"
qrencode -t ansiutf8 < /etc/wireguard/${CLIENT_NAME}.conf
echo ""
echo -e "${GREEN}Setup complete! Install WireGuard client on your device and import the config.${NC}"
