import { NextRequest, NextResponse } from 'next/server';

import { adminListUsers } from '../../../utils/db';
import { adminUnauthorized } from '../utils';

export function GET(request: NextRequest) {
  return adminUnauthorized(request) ?? NextResponse.json(adminListUsers());
}
