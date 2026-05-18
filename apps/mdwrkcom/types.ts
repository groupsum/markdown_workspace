import React from 'react';

export interface FeatureItem {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

export enum DemoStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface MarkdownTemplate {
  name: string;
  prompt: string;
}