import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import mermaid from "mermaid";

const DatabaseSchema = () => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose'
    });
    
    if (mermaidRef.current) {
      mermaid.render('schema-diagram-svg', mermaidContent).then(({ svg }) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
      });
    }
  }, []);

  const downloadDiagram = async () => {
    const element = document.getElementById('schema-diagram');
    if (element) {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('real-estate-database-schema.pdf');
    }
  };

  const mermaidContent = `erDiagram
    users ||--o{ agents : "is_agent"
    users ||--o{ owners : "is_owner"
    users ||--o{ tenants : "is_tenant"
    users ||--o{ admins : "is_admin"
    users ||--o{ user_sessions : "has"
    users ||--o{ notifications : "receives"
    users ||--o{ saved_properties : "saves"
    users ||--o{ property_searches : "performs"
    users ||--o{ user_analytics : "tracked_in"

    agents ||--o{ properties : "manages"
    agents ||--o{ agent_reviews : "receives"
    agents ||--o{ agent_requests : "handles"
    agents ||--o{ agent_complaints : "subject_of"
    agents ||--o{ messages : "sends"
    agents ||--o{ property_viewings : "schedules"
    agents ||--o{ agent_analytics : "tracked_in"

    owners ||--o{ properties : "owns"
    owners ||--o{ tenant_applications : "reviews"

    tenants ||--o{ tenant_applications : "submits"
    tenants ||--o{ complaints : "files"
    tenants ||--o{ tenant_verifications : "has"

    properties ||--o{ property_images : "has"
    properties ||--o{ property_features : "has"
    properties ||--o{ property_price_history : "has"
    properties ||--o{ property_viewings : "scheduled_for"
    properties ||--o{ brochure_requests : "requested_for"
    properties ||--o{ saved_properties : "saved_as"
    properties ||--o{ property_searches : "found_in"
    properties ||--o{ property_analytics : "tracked_in"

    messages ||--|| conversations : "belongs_to"
    users ||--o{ conversations : "participates_in"

    complaints ||--o{ complaint_responses : "has"
    complaints ||--|| complaint_categories : "categorized_as"

    agent_requests ||--|| request_categories : "categorized_as"

    users {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        string phone
        enum user_type
        boolean email_verified
        timestamp created_at
        timestamp updated_at
        timestamp last_login
        boolean is_active
    }

    agents {
        uuid id PK
        uuid user_id FK
        string license_number UK
        string company
        text bio
        string specializations
        decimal commission_rate
        integer years_experience
        string office_address
        decimal rating
        integer total_reviews
        boolean is_verified
        timestamp created_at
        timestamp updated_at
    }

    owners {
        uuid id PK
        uuid user_id FK
        string company_name
        string tax_id
        text preferred_contact_method
        timestamp created_at
        timestamp updated_at
    }

    tenants {
        uuid id PK
        uuid user_id FK
        decimal monthly_income
        text employment_details
        text rental_history
        integer credit_score
        boolean background_check_passed
        timestamp created_at
        timestamp updated_at
    }

    admins {
        uuid id PK
        uuid user_id FK
        enum admin_level
        json permissions
        timestamp created_at
        timestamp updated_at
    }

    properties {
        uuid id PK
        uuid owner_id FK
        uuid agent_id FK
        string title
        text description
        enum property_type
        enum listing_type
        decimal price
        string currency
        string address
        string city
        string state
        string postal_code
        string country
        decimal latitude
        decimal longitude
        integer bedrooms
        integer bathrooms
        decimal square_feet
        integer year_built
        enum status
        boolean featured
        timestamp listed_date
        timestamp updated_at
        json additional_details
    }

    property_images {
        uuid id PK
        uuid property_id FK
        string image_url
        string alt_text
        integer display_order
        boolean is_primary
        timestamp uploaded_at
    }

    property_features {
        uuid id PK
        uuid property_id FK
        string feature_name
        string feature_value
        string category
    }

    property_price_history {
        uuid id PK
        uuid property_id FK
        decimal previous_price
        decimal new_price
        string reason
        timestamp changed_at
    }

    saved_properties {
        uuid id PK
        uuid user_id FK
        uuid property_id FK
        timestamp saved_at
        text notes
    }

    property_searches {
        uuid id PK
        uuid user_id FK
        json search_criteria
        integer results_count
        timestamp searched_at
        boolean saved_search
    }

    property_viewings {
        uuid id PK
        uuid property_id FK
        uuid agent_id FK
        uuid user_id FK
        timestamp scheduled_time
        integer duration_minutes
        enum status
        text notes
        timestamp created_at
        timestamp updated_at
    }

    brochure_requests {
        uuid id PK
        uuid property_id FK
        uuid user_id FK
        string full_name
        string email
        string phone
        enum delivery_method
        string delivery_address
        timestamp requested_at
        enum status
        timestamp processed_at
    }

    conversations {
        uuid id PK
        string subject
        enum conversation_type
        json participants
        timestamp created_at
        timestamp updated_at
        timestamp last_message_at
    }

    messages {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        text content
        enum message_type
        json attachments
        boolean is_read
        timestamp sent_at
        timestamp read_at
    }

    complaints {
        uuid id PK
        uuid complainant_id FK
        uuid agent_id FK
        uuid category_id FK
        string subject
        text description
        enum priority
        enum status
        timestamp filed_at
        timestamp resolved_at
        uuid assigned_to
    }

    complaint_categories {
        uuid id PK
        string name
        text description
        boolean is_active
    }

    complaint_responses {
        uuid id PK
        uuid complaint_id FK
        uuid responder_id FK
        text response
        enum response_type
        timestamp created_at
    }

    agent_reviews {
        uuid id PK
        uuid agent_id FK
        uuid reviewer_id FK
        integer rating
        text review_text
        json review_aspects
        timestamp created_at
        boolean is_verified
    }

    agent_requests {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        string subject
        text description
        enum priority
        enum status
        json request_data
        timestamp submitted_at
        timestamp processed_at
        uuid assigned_agent_id
    }

    request_categories {
        uuid id PK
        string name
        text description
        boolean is_active
    }

    tenant_applications {
        uuid id PK
        uuid tenant_id FK
        uuid property_id FK
        uuid owner_id FK
        enum status
        json application_data
        timestamp submitted_at
        timestamp reviewed_at
        text review_notes
    }

    tenant_verifications {
        uuid id PK
        uuid tenant_id FK
        enum verification_type
        enum status
        json verification_data
        timestamp initiated_at
        timestamp completed_at
        string verified_by
    }

    notifications {
        uuid id PK
        uuid user_id FK
        string title
        text content
        enum type
        json data
        boolean is_read
        timestamp created_at
        timestamp read_at
    }

    user_sessions {
        uuid id PK
        uuid user_id FK
        string session_token
        string device_info
        string ip_address
        timestamp created_at
        timestamp expires_at
        timestamp last_activity
    }

    user_analytics {
        uuid id PK
        uuid user_id FK
        string event_type
        json event_data
        string page_url
        string user_agent
        string ip_address
        timestamp created_at
    }

    property_analytics {
        uuid id PK
        uuid property_id FK
        uuid user_id FK
        string event_type
        json event_data
        timestamp created_at
    }

    agent_analytics {
        uuid id PK
        uuid agent_id FK
        string event_type
        json event_data
        timestamp created_at
    }`;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Database Schema</h1>
          <p className="text-muted-foreground mt-2">Real Estate Platform Entity Relationship Diagram</p>
        </div>
        <Button onClick={downloadDiagram} className="gap-2">
          <Download className="h-4 w-4" />
          Download Schema
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entity Relationship Diagram</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="schema-diagram" className="bg-white p-4 rounded overflow-auto">
            <div ref={mermaidRef} className="min-h-[600px] w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseSchema;