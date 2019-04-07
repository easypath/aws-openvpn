#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/cdk');
import { Epc2AwsBaseAppStack } from '../lib/aws-openvpn-stack';

const app = new cdk.App();
new Epc2AwsBaseAppStack(app, 'AwsOpenVpnStack');
