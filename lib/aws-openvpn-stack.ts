import cdk = require('@aws-cdk/cdk');
import ec2 = require('@aws-cdk/aws-ec2');
import { SubnetType, CfnInstance } from '@aws-cdk/aws-ec2';

const APP_CODE = process.env.APP_CODE || 'openvpn';
const ENV = process.env.ENV || 'dev';
const VPC_CIDR = process.env.VPC_CIDR || '192.168.0.0/24';
const VPN_AMI_ID = process.env.VPN_AMI_ID || 'ami-07a8d85046c8ecc99'; // OpenVPN Access Server, us-east-1
const VPN_INSTANCE_TYPE = process.env.VPN_INSTANCE_TYPE || 't3.nano';
const SSH_KEY = process.env.SSH_KEY;
const ALLOWED_CIDR = process.env.ALLOWED_CIDR;
const EIP = process.env.EIP;

export class Epc2AwsBaseAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.VpcNetwork(this, 'VPC', {
      cidr: VPC_CIDR,
      maxAZs: 1,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 28,
          name: `${APP_CODE}-${ENV}-public`,
          subnetType: SubnetType.Public,
        }
      ],
    });

    const vpnSecurityGroup = new ec2.SecurityGroup(this, 'VpnSG', {
      groupName: `${APP_CODE}-${ENV}-sg`,
      vpc,
      description: 'OpenVPN Access Server',
      allowAllOutbound: true
    });
    vpnSecurityGroup.addIngressRule(new ec2.CidrIPv4(ALLOWED_CIDR || vpnSecurityGroup.securityGroupId), new ec2.TcpPort(22), 'Allow SSH');
    vpnSecurityGroup.addIngressRule(new ec2.CidrIPv4(ALLOWED_CIDR || vpnSecurityGroup.securityGroupId), new ec2.TcpPort(443), 'OpenVPN HTTPS');
    vpnSecurityGroup.addIngressRule(new ec2.CidrIPv4(ALLOWED_CIDR || vpnSecurityGroup.securityGroupId), new ec2.UdpPort(1194), 'OpenVPN client connections');

    const vpnInstance = new CfnInstance(this, 'VpnInstance', {
      imageId: VPN_AMI_ID,
      instanceType: VPN_INSTANCE_TYPE,
      subnetId: vpc.publicSubnets[0].subnetId,
      keyName: SSH_KEY,
      sourceDestCheck: false,
      securityGroupIds: [ 
        vpnSecurityGroup.securityGroupId
      ]
    });

    new ec2.CfnEIPAssociation(this, 'VpnEip', {
      eip: EIP,
      instanceId: vpnInstance.instanceId
    });

  }
}
