<?php

namespace App\Mail;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerificationMail extends Mailable

{
    use Queueable, SerializesModels;

    public $user;
    public $token;

    public function __construct($user)
    {
        $this->user = $user;
        $this->token = $user->email_verify_token; // Store the token here
    }

    public function build()
    {
        return $this->subject('Email Verification') // Email subject
        ->view('mail.email-verification-mail') // View path
        ->with([
            'customer' => $this->user, // Pass the customer object
            'token' => $this->token, // Pass the token
        ]);
    }
}

