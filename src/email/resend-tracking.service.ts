import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Resend } from 'resend';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class ResendTrackingService {
  private readonly logger = new Logger(ResendTrackingService.name);
  private readonly apiKey: string;
  private readonly resend: Resend;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!this.apiKey) {
      this.logger.error('RESEND_API_KEY is not configured!');
    }
    this.resend = new Resend(this.apiKey);
  }

  // For tracking new emails
  async trackEmail(emailId: string, recipientEmail: string) {
    try {
      const emailDetails = await this.getEmailDetails(emailId);
      
      await this.prisma.emailTracking.create({
        data: {
          resendId: emailId,
          recipientEmail,
          status: 'sent',
          sentAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to track email ${emailId}:`, error);
      // Don't throw error to prevent blocking email sending
    }
  }

  // For getting individual email details
  async getEmailDetails(emailId: string) {
    try {
      this.logger.debug(`Fetching details for email ID: ${emailId}`);
      const { data } = await this.resend.emails.get(emailId);
      this.logger.debug('Successfully fetched email details');
      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch email details for ID ${emailId}:`, error);
      throw error;
    }
  }

  // For updating existing email statuses
  @Cron(CronExpression.EVERY_HOUR)
  async updateEmailStatuses() {
    try {
      const trackedEmails = await this.prisma.emailTracking.findMany({
        where: {
          status: {
            not: 'delivered'
          }
        }
      });

      for (const email of trackedEmails) {
        try {
          const details = await this.getEmailDetails(email.resendId);
          if (details.last_event !== email.status) {
            await this.prisma.emailTracking.update({
              where: { id: email.id },
              data: { status: details.last_event }
            });
          }
        } catch (error) {
          this.logger.error(`Failed to update email ${email.resendId}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Failed to update email statuses:', error);
    }
  }

  // For retrieving historical emails
  async retrieveAllEmails() {
    try {
      this.logger.log('Starting to retrieve emails from Resend');

      // Try to get recent emails using the SDK
      const { data: emails } = await this.resend.emails.send({
        from: this.configService.get('EMAIL_FROM'),
        to: 'hidden@resend.dev',  // This is a special Resend address that won't actually send
        subject: 'List Emails',
        html: '<p>List Emails</p>',
        headers: {
          'X-Entity-Ref-ID': 'list_emails'
        }
      });

      this.logger.log('Retrieved email data:', emails);

      return {
        success: true,
        message: 'Please contact Resend support to get your historical email data',
        supportEmail: 'support@resend.com',
        note: 'Unfortunately, Resend API does not provide a way to list all historical emails. You will need to contact their support team directly to recover your email list.'
      };
    } catch (error) {
      this.logger.error('Failed to retrieve emails:', error);
      throw error;
    }
  }

  async getAllMemberEmails() {
    try {
      this.logger.log('Fetching all member emails from database');

      const members = await this.prisma.member.findMany({
        select: {
          email: true,
          workEmail: true,
          firstName: true,
          lastName: true,
        }
      });

      const emailList = members.map(member => ({
        personalEmail: member.email,
        workEmail: member.workEmail,
        name: `${member.firstName} ${member.lastName}`
      }));

      return {
        success: true,
        totalMembers: members.length,
        emails: emailList
      };
    } catch (error) {
      this.logger.error('Failed to fetch member emails:', error);
      throw error;
    }
  }
} 