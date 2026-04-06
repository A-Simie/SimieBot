import { tool } from '@langchain/core/tools';
import { z } from 'zod';

import { aspectRatioSchema, planVideoEditWithNova, videoEditPlanSchema } from '../creator-pipeline';
import { toTypedToolError } from './tool-errors';

const stagedAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().nullable(),
  durationSeconds: z.number().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  bucket: z.string(),
  key: z.string(),
  s3Uri: z.string(),
});

export const analyzeVideoWithNovaTool = tool(
  async ({ stagedAsset, creativeGoal, outputAspectRatio, maxClipDurationSeconds, additionalContext }) => {
    try {
      const warnings = [
        stagedAsset.durationSeconds == null ? 'The staged asset is missing stored duration metadata.' : null,
        stagedAsset.width == null || stagedAsset.height == null
          ? 'The staged asset is missing stored width/height metadata, so Nova will rely more heavily on direct video inspection.'
          : null,
      ].filter((warning): warning is string => Boolean(warning));

      const plan = await planVideoEditWithNova({
        stagedAsset,
        creativeGoal,
        outputAspectRatio,
        maxClipDurationSeconds,
        additionalContext,
      });

      return {
        status: 'planned',
        stagedAsset: {
          id: stagedAsset.id,
          name: stagedAsset.name,
          s3Uri: stagedAsset.s3Uri,
        },
        warnings,
        editPlan: videoEditPlanSchema.parse(plan),
      };
    } catch (error) {
      return toTypedToolError('analyze_video_with_nova', error);
    }
  },
  {
    name: 'analyze_video_with_nova',
    description:
      'Use Amazon Nova to generate a structured FFmpeg-ready video edit plan for a staged source asset.',
    schema: z.object({
      stagedAsset: stagedAssetSchema.describe('The staged video asset previously downloaded to S3.'),
      creativeGoal: z.string().describe('What kind of final video should be created from the source.'),
      outputAspectRatio: aspectRatioSchema.optional().default('9:16'),
      maxClipDurationSeconds: z.number().min(5).max(90).optional().default(30),
      additionalContext: z.string().optional(),
    }),
  },
);
