<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\LeaveRequest;

class LeaveRequestFormRequest extends FormRequest
{
    public function authorize()
    {
        // Only the Head (authenticated user) can submit leave requests
        return true;
    }

    public function rules()
    {
        return [
            'employee_id'   => 'required|exists:employees,id',
            'start_leave'   => 'required|date',
            'end_leave'     => 'required|date|after_or_equal:start_leave',
            'type_of_leave' => [
                'required',
                Rule::in(['sick', 'vacation', 'emergency', 'maternity', 'paternity', 'bereavement', 'unpaid'])
            ],
            'proof_file'    => 'nullable|file|mimes:pdf,png,jpg,jpeg|max:5120',
            'status'        => ['required', Rule::in(LeaveRequest::STATUSES)],
            'rejection_reason' => 'nullable|required_if:status,Rejected|string|max:255',
        ];
    }

    public function messages()
    {
        return [
            'employee_id.required'   => 'Please select an employee.',
            'start_leave.required'   => 'Start date is required.',
            'end_leave.required'     => 'End date is required.',
            'end_leave.after_or_equal' => 'End date must be after or equal to the start date.',
            'type_of_leave.required' => 'Please specify the type of leave.',
            'proof_file.mimes'       => 'Proof must be a file of type: pdf, png, jpg, jpeg.',
            'status.in'              => 'Invalid status value.',
            'rejection_reason.required_if' => 'Rejection reason is required when rejecting a leave request.'
        ];
    }
}
