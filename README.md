# aws-openvpn
Sets up an OpenVPN Access Server appliance running on AWS. Refer to the [quick start guide](https://openvpn.net/vpn-server-resources/amazon-web-services-ec2-byol-appliance-quick-start-guide/) for more information.


## Prerequisites:
- Pre-allocated elastic IP
- Subscribe to the [OpenVPN AMI](https://aws.amazon.com/marketplace/pp/B00MI40CAE) in your AWS account
- SSH key pair imported into your AWS account *(EC2 > Key Pairs)*
- [AWS Cloud Development Kit (CDK)](https://github.com/awslabs/aws-cdk) installed locally, used to provision resources; requires [Node.js](https://github.com/creationix/nvm)


## Installation:
- Copy `.env.sample` to `.env` and populate the required values:
  ```js
  ALLOWED_CIDR= // Your home IP
  EIP= // Elastic IP, needs to be pre-allocated
  SSH_KEY= // Name of SSH key pair
  ```
- Install dependencies:
  ```
  npm install
  ```
- Generate CloudFormation and deploy stack:
  ```
  cdk synth
  cdk deploy
  ```
  *Note: ensure AWS CDK has been bootstrapped first*

- SSH into the OpenVPN appliance:
  ```
  ssh -i SSH_KEY openvpnas@ELASTIC_IP
  ```

- Complete initial setup using the options below:
  ```
  Will this be the primary Access Server node?
  (enter 'no' to configure as a backup or standby node)
  > Press ENTER for default [yes]: 

  Please specify the network interface and IP address to be
  used by the Admin Web UI:
  (1) all interfaces: 0.0.0.0
  (2) ens5: 192.168.0.7
  Please enter the option number from the list above (1-2).
  > Press Enter for default [2]: 1

  Please specify the port number for the Admin Web UI.
  > Press ENTER for default [943]: 443

  Please specify the TCP port number for the OpenVPN Daemon
  > Press ENTER for default [443]: 

  Should client traffic be routed by default through the VPN?
  > Press ENTER for default [no]: yes

  Should client DNS traffic be routed by default through the VPN?
  > Press ENTER for default [no]: 

  Use local authentication via internal DB?
  > Press ENTER for default [yes]: 

  Should private subnets be accessible to clients by default?
  > Press ENTER for EC2 default [yes]: 

  Do you wish to login to the Admin UI as "openvpn"?
  > Press ENTER for default [yes]: 

  > Please specify your OpenVPN-AS license key (or leave blank to specify later): 
  ```

- Set the server's timezone to your locality:
  ```
  sudo dpkg-reconfigure tzdata
  ```

- Set a password for the `openvpn` user:
  ```
  sudo passwd openvpn
  ```
  ***Note: this is the password used by the OpenVPN client***

- Login to the OpenVPN admin portal:
  ```
  https://ELASTIC_IP/admin
  ```

- Navigate to `Configuration > VPN Settings > DNS Settings > Have clients use specific DNS servers`, set the following:
  ```
  Primary DNS Server: 8.8.8.8
  ```
  *Note: any public DNS server can be used here, including your own ISP's*

- Click `Save > Update Running Server`

- Download and install the appropriate OpenVPN client for your local OS:
  ```
  https://ELASTIC_IP/?src=connect
  ```

- Launch the client and connect; default username is `openvpn` and password is the value previously set

- Confirm the OpenVPN client connects successfully and you are able to browse the Internet. Run the following and verify the returned IP matches your AWS EIP:
  ```
  curl https://ifconfig.io
  ```


## Notes:
- For use in AWS region `us-east-1`; if using a different region, need to update the `VPN_AMI_ID` value
- The free version of the OpenVPN Access Server only allows 2 active connections
