'use client'
import React from 'react'
import ResumeBuilder from '../components/generators/ResumeBuilder'
import AuthGuard from '../components/auth/AuthGuard'

export default function BuilderPage() {
  return (
    <AuthGuard>
      <ResumeBuilder />
    </AuthGuard>
  )
}
