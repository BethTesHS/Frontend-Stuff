# app/routes/tenant_messaging.py - Updated tenant messaging routes

from flask import Blueprint, request, current_app, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import and_, or_, desc
import os
import uuid
from werkzeug.utils import secure_filename

from app import db
from app.models.user_models import User, UserProfile
from app.models.property_models import Property
from app.models.tenant_verification import TenantProfile
from app.models.tenant_messaging import TenantConversation, TenantMessage
from app.utils.response_utils import success_response, error_response

tenant_messaging_bp = Blueprint('tenant_messaging', __name__)

# File upload configuration
MESSAGING_UPLOAD_FOLDER = 'uploads/message_attachments'
ALLOWED_ATTACHMENT_EXTENSIONS = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'gif', 'mp4', 'avi', 'mov'}
MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024  # 10MB

def allowed_attachment(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_ATTACHMENT_EXTENSIONS

def handle_attachment_upload(file, conversation_id):
    """Handle file upload for message attachments"""
    if not file or not file.filename or not allowed_attachment(file.filename):
        return None, None, None, None
    
    try:
        # Create upload directory
        upload_dir = os.path.join(current_app.root_path, MESSAGING_UPLOAD_FOLDER, str(conversation_id))
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_ext = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"attachment_{uuid.uuid4().hex}.{file_ext}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_ATTACHMENT_SIZE:
            return None, None, None, None
        
        # Save file
        file.save(file_path)
        
        # Return relative URL path for frontend
        relative_path = os.path.join(str(conversation_id), unique_filename)
        
        return secure_filename(file.filename), relative_path, file_size, file_ext
        
    except Exception as e:
        current_app.logger.error(f"Attachment upload error: {str(e)}")
        return None, None, None, None

def get_user_role(user_id):
    """Get user role from User model"""
    user = User.query.get(user_id)
    if user and hasattr(user, 'role'):
        return user.role
    
    # Fallback: try UserProfile if User doesn't have role directly
    user_profile = UserProfile.query.filter_by(user_id=user_id).first()
    if user_profile and user_profile.role:
        return user_profile.role.name if hasattr(user_profile.role, 'name') else user_profile.role
    return None

def has_conversation_access(conversation, user_id, user_role):
    """Check if user has access to the conversation"""
    if user_role == 'tenant':
        return conversation.user_id == user_id
    else:
        return conversation.agent_id == user_id or conversation.owner_id == user_id

def add_cors_headers(response):
    """Add CORS headers to response"""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

# Simple send endpoint (handles both new conversations and replies)
@tenant_messaging_bp.route('/send', methods=['POST', 'OPTIONS'])
@jwt_required()
def send_message():
    """Send a message (create conversation or add to existing)"""
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'OK'})
        return add_cors_headers(response)
    
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return error_response("User not found", status_code=404)
        
        user_role = get_user_role(current_user_id)
        if not user_role:
            return error_response("User role not found", status_code=403)
        
        # Handle both JSON and form data
        if request.content_type and 'multipart/form-data' in request.content_type:
            data = request.form.to_dict()
            files = request.files
        else:
            data = request.get_json()
            files = {}
        
        conversation_id = data.get('conversation_id')
        message_text = data.get('message_text', '').strip()
        subject = data.get('subject', '').strip()
        
        current_app.logger.info(f"Validation - message_text: '{message_text}', len: {len(message_text)}, bool: {bool(message_text)}")
        
        if not message_text:
            return error_response("Message is required", status_code=400)
        
        # If no conversation_id, create new conversation (tenant only)
        if not conversation_id:
            if user_role != 'tenant':
                return error_response("Only tenants can create new conversations", status_code=403)
            
            if not subject:
                return error_response("Subject is required for new conversations", status_code=400)
            
            # Get tenant's active property
            tenant_profile = TenantProfile.query.filter_by(
                user_id=current_user_id,
                is_active=True
            ).first()
            
            if not tenant_profile:
                return error_response("No active tenancy found", status_code=404)
            
            property_obj = tenant_profile.property
            if not property_obj:
                return error_response("Property not found", status_code=404)
            
            # Create conversation
            conversation = TenantConversation(
                user_id=current_user_id,
                user_name=user.full_name,
                user_type='tenant',
                agent_id=property_obj.agent_id,
                owner_id=property_obj.owner_id,
                property_id=property_obj.id,
                subject=subject,
                status='open',
                last_message_at=datetime.utcnow(),
                unread_count_tenant=0,
                unread_count_agent=1
            )
            
            db.session.add(conversation)
            db.session.flush()
            conversation_id = conversation.id
        else:
            # Get existing conversation
            conversation = TenantConversation.query.get(conversation_id)
            if not conversation:
                return error_response("Conversation not found", status_code=404)
            
            if not has_conversation_access(conversation, current_user_id, user_role):
                return error_response("Access denied", status_code=403)
        
        # Handle file attachment
        attachment_name = None
        attachment_url = None
        attachment_size = None
        attachment_type = None
        
        if files and 'attachment' in files:
            attachment_name, attachment_url, attachment_size, attachment_type = handle_attachment_upload(
                files['attachment'], conversation_id
            )
        
        # Determine sender type
        if user_role == 'tenant':
            sender_type = 'tenant'
        elif conversation.agent_id == current_user_id:
            sender_type = 'agent'
        else:
            sender_type = 'owner'
        
        # Create message
        message = TenantMessage(
            conversation_id=conversation_id,
            sender_id=current_user_id,
            sender_name=user.full_name,
            sender_type=sender_type,
            message_text=message_text,
            attachment_url=attachment_url,
            attachment_name=attachment_name,
            attachment_size=attachment_size,
            attachment_type=attachment_type,
            is_read_by_tenant=sender_type == 'tenant',
            is_read_by_agent=sender_type != 'tenant'
        )
        
        db.session.add(message)
        
        # Update conversation
        conversation.last_message_at = datetime.utcnow()
        conversation.status = 'open'
        conversation.increment_unread_for_recipients(sender_type)
        
        db.session.commit()
        
        return success_response(
            data={
                'message': message.to_dict(user_role),
                'conversation': {
                    'id': conversation.id,
                    'subject': conversation.subject,
                    'status': conversation.status
                }
            },
            message="Message sent successfully"
        )
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Send message error: {str(e)}")
        return error_response("Failed to send message", status_code=500)


# Get tenant's conversations (matches frontend API)
@tenant_messaging_bp.route('/conversations', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_conversations():
    """Get all conversations for the current user"""
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'OK'})
        return add_cors_headers(response)
    
    current_app.logger.info("GET /conversations - Function reached")
    
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        current_app.logger.info(f"GET /conversations - User ID: {current_user_id}, User found: {user is not None}")
        
        if not user:
            return error_response("User not found", status_code=404)
        
        user_role = get_user_role(current_user_id)
        current_app.logger.info(f"GET /conversations - User role: {user_role}")
        
        if not user_role:
            return error_response("User role not found", status_code=403)
        
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        status_filter = request.args.get('status', 'all')
        search = request.args.get('search', '').strip()
        
        # Modified query to group conversations by sender for agents/owners
        if user_role == 'tenant':
            conversations_query = TenantConversation.query.filter_by(user_id=current_user_id)
            conversations_query = conversations_query.order_by(desc(TenantConversation.last_message_at))
            conversations = conversations_query.paginate(page=page, per_page=limit, error_out=False)
            
            conversations_data = []
            for conv in conversations.items:
                # Get latest message
                latest_message = TenantMessage.query.filter_by(conversation_id=conv.id)\
                    .order_by(desc(TenantMessage.created_at)).first()
                
                # Get property info
                property_data = None
                if conv.property:
                    property_data = {
                        'id': conv.property.id,
                        'title': conv.property.title,
                        'address': conv.property.address,
                        'city': conv.property.city,
                        'postcode': conv.property.postcode
                    }
                
                # Get other participant info
                other_participant = conv.get_other_participant(current_user_id, user_role)
                
                # Get unread count for current user
                unread_count = conv.get_unread_count_for_user(current_user_id, user_role)
                
                conversation_data = {
                    'id': conv.id,
                    'subject': conv.subject,
                    'status': conv.status,
                    'unread_count': unread_count,
                    'last_message_at': conv.last_message_at.isoformat() if conv.last_message_at else None,
                    'created_at': conv.created_at.isoformat(),
                    'property': property_data,
                    'other_participant': other_participant,
                    'latest_message': {
                        'text': latest_message.message_text[:100] + '...' if latest_message and latest_message.message_text and len(latest_message.message_text) > 100 else (latest_message.message_text if latest_message else None),
                        'sender_name': latest_message.sender_name if latest_message else None,
                        'created_at': latest_message.created_at.isoformat() if latest_message else None,
                        'has_attachment': latest_message.has_attachment() if latest_message else False
                    } if latest_message else None
                }
                
                conversations_data.append(conversation_data)
                
        else:
            # For agents/owners: Group conversations by sender (user_id)
            # Get all conversations for this agent/owner
            all_conversations = TenantConversation.query.filter(
                or_(
                    TenantConversation.agent_id == current_user_id,
                    TenantConversation.owner_id == current_user_id
                )
            ).all()
            
            # Group conversations by user_id (sender)
            grouped_conversations = {}
            for conv in all_conversations:
                user_key = conv.user_id
                if user_key not in grouped_conversations:
                    grouped_conversations[user_key] = {
                        'conversations': [],
                        'latest_message_time': None,
                        'total_unread': 0
                    }
                
                grouped_conversations[user_key]['conversations'].append(conv)
                
                # Track latest message time across all conversations for this user
                if conv.last_message_at:
                    if (grouped_conversations[user_key]['latest_message_time'] is None or 
                        conv.last_message_at > grouped_conversations[user_key]['latest_message_time']):
                        grouped_conversations[user_key]['latest_message_time'] = conv.last_message_at
                
                # Add up unread counts from all conversations for this user
                unread_count = conv.get_unread_count_for_user(current_user_id, user_role)
                grouped_conversations[user_key]['total_unread'] += unread_count
            
            # Apply filters and search
            if status_filter != 'all':
                # Filter grouped conversations based on status
                filtered_groups = {}
                for user_id, group_data in grouped_conversations.items():
                    filtered_convs = [conv for conv in group_data['conversations'] if conv.status == status_filter]
                    if filtered_convs:
                        group_data['conversations'] = filtered_convs
                        filtered_groups[user_id] = group_data
                grouped_conversations = filtered_groups
            
            if search:
                # Filter by search term (user name or subject)
                filtered_groups = {}
                for user_id, group_data in grouped_conversations.items():
                    # Check if any conversation in the group matches the search
                    matching_convs = []
                    for conv in group_data['conversations']:
                        # Get the tenant user for this conversation
                        tenant_user = User.query.get(conv.user_id)
                        tenant_name = tenant_user.full_name if tenant_user else ""
                        
                        if (search.lower() in tenant_name.lower() or 
                            search.lower() in conv.subject.lower()):
                            matching_convs.append(conv)
                    
                    if matching_convs:
                        group_data['conversations'] = matching_convs
                        filtered_groups[user_id] = group_data
                grouped_conversations = filtered_groups
            
            # Sort by latest message time and paginate
            sorted_groups = sorted(
                grouped_conversations.items(),
                key=lambda x: x[1]['latest_message_time'] or datetime.min,
                reverse=True
            )
            
            # Manual pagination
            total_groups = len(sorted_groups)
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit
            paginated_groups = sorted_groups[start_idx:end_idx]
            
            conversations_data = []
            for user_id, group_data in paginated_groups:
                # Get the most recent conversation for this user to represent the group
                main_conversation = max(group_data['conversations'], 
                                      key=lambda x: x.last_message_at or datetime.min)
                
                # Get the latest message across all conversations for this user
                all_messages = []
                for conv in group_data['conversations']:
                    conv_messages = TenantMessage.query.filter_by(conversation_id=conv.id).all()
                    all_messages.extend(conv_messages)
                
                latest_message = max(all_messages, key=lambda x: x.created_at) if all_messages else None
                
                # Get property info from the main conversation
                property_data = None
                if main_conversation.property:
                    property_data = {
                        'id': main_conversation.property.id,
                        'title': main_conversation.property.title,
                        'address': main_conversation.property.address,
                        'city': main_conversation.property.city,
                        'postcode': main_conversation.property.postcode
                    }
                
                # Get other participant info
                other_participant = main_conversation.get_other_participant(current_user_id, user_role)
                
                # Create a virtual conversation that represents all conversations with this user
                conversation_data = {
                    'id': main_conversation.id,  # Use the main conversation ID for loading messages
                    'user_id': user_id,  # Add user_id for grouping reference
                    'conversation_ids': [conv.id for conv in group_data['conversations']],  # All conversation IDs for this user
                    'subject': f"Chat with {main_conversation.user_name}",  # Generic subject
                    'status': main_conversation.status,
                    'unread_count': group_data['total_unread'],
                    'last_message_at': group_data['latest_message_time'].isoformat() if group_data['latest_message_time'] else None,
                    'created_at': main_conversation.created_at.isoformat(),
                    'property': property_data,
                    'other_participant': other_participant,
                    'latest_message': {
                        'text': latest_message.message_text[:100] + '...' if latest_message and latest_message.message_text and len(latest_message.message_text) > 100 else (latest_message.message_text if latest_message else None),
                        'sender_name': latest_message.sender_name if latest_message else None,
                        'created_at': latest_message.created_at.isoformat() if latest_message else None,
                        'has_attachment': latest_message.has_attachment() if latest_message else False
                    } if latest_message else None
                }
                
                conversations_data.append(conversation_data)
            
            # Simulate pagination response
            has_next = end_idx < total_groups
            has_prev = start_idx > 0
            total_pages = (total_groups + limit - 1) // limit
        
        return success_response(
            data={
                'conversations': conversations_data,
                'pagination': {
                    'total': total_groups if user_role != 'tenant' else conversations.total,
                    'page': page,
                    'pages': total_pages if user_role != 'tenant' else conversations.pages,
                    'has_next': has_next if user_role != 'tenant' else conversations.has_next,
                    'has_prev': has_prev if user_role != 'tenant' else conversations.has_prev
                }
            },
            message="Conversations retrieved successfully"
        )
        
    except Exception as e:
        current_app.logger.error(f"Get conversations error: {str(e)}")
        return error_response("Failed to retrieve conversations", status_code=500)



# Create new conversation endpoint
@tenant_messaging_bp.route('/conversations', methods=['POST', 'OPTIONS'])
@jwt_required()
def create_conversation():
    """Create a new conversation (tenant only)"""
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'OK'})
        return add_cors_headers(response)
    
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return error_response("User not found", status_code=404)
        
        user_role = get_user_role(current_user_id)
        if user_role != 'tenant':
            return error_response("Only tenants can create new conversations", status_code=403)
        
        data = request.get_json()
        subject = data.get('subject', '').strip()
        message_text = data.get('message_text', '').strip()
        
        if not subject:
            return error_response("Subject is required", status_code=400)
        if not message_text:
            return error_response("Message is required", status_code=400)
        
        # Get tenant's active property
        tenant_profile = TenantProfile.query.filter_by(
            user_id=current_user_id,
            is_active=True
        ).first()
        
        if not tenant_profile:
            return error_response("No active tenancy found", status_code=404)
        
        property_obj = tenant_profile.property
        if not property_obj:
            return error_response("Property not found", status_code=404)
        
        # Create conversation
        conversation = TenantConversation(
            user_id=current_user_id,
            user_name=user.full_name,
            user_type='tenant',
            agent_id=property_obj.agent_id,
            owner_id=property_obj.owner_id,
            property_id=property_obj.id,
            subject=subject,
            status='open',
            last_message_at=datetime.utcnow(),
            unread_count_tenant=0,
            unread_count_agent=1
        )
        
        db.session.add(conversation)
        db.session.flush()
        
        # Create initial message
        message = TenantMessage(
            conversation_id=conversation.id,
            sender_id=current_user_id,
            sender_name=user.full_name,
            sender_type='tenant',
            message_text=message_text,
            is_read_by_tenant=True,
            is_read_by_agent=False
        )
        
        db.session.add(message)
        db.session.commit()
        
        return success_response(
            data={
                'conversation': {
                    'id': conversation.id,
                    'subject': conversation.subject,
                    'status': conversation.status,
                    'created_at': conversation.created_at.isoformat()
                },
                'message': message.to_dict(user_role)
            },
            message="Conversation created successfully"
        )
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Create conversation error: {str(e)}")
        return error_response("Failed to create conversation", status_code=500)

# Get tenant's conversations (preferred endpoint)
@tenant_messaging_bp.route('/my-conversations', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_my_conversations():
    """Get tenant's conversations (simplified view)"""
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'OK'})
        return add_cors_headers(response)
    
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return error_response("User not found", status_code=404)
        
        user_role = get_user_role(current_user_id)
        if not user_role:
            return error_response("User role not found", status_code=403)
        
        # Query conversations based on user role
        if user_role == 'tenant':
            conversations_query = TenantConversation.query.filter_by(user_id=current_user_id)
        else:
            conversations_query = TenantConversation.query.filter(
                or_(
                    TenantConversation.agent_id == current_user_id,
                    TenantConversation.owner_id == current_user_id
                )
            )
        
        conversations = conversations_query.order_by(desc(TenantConversation.last_message_at)).all()
        
        conversations_data = []
        for conv in conversations:
            # Get latest message
            latest_message = TenantMessage.query.filter_by(conversation_id=conv.id)\
                .order_by(desc(TenantMessage.created_at)).first()
            
            # Get unread count for current user
            unread_count = conv.get_unread_count_for_user(current_user_id, user_role)
            
            conversation_data = {
                'id': conv.id,
                'subject': conv.subject,
                'status': conv.status,
                'unread_count': unread_count,
                'last_message_at': conv.last_message_at.isoformat() if conv.last_message_at else None,
                'created_at': conv.created_at.isoformat(),
                'latest_message': {
                    'text': latest_message.message_text if latest_message else None,
                    'sender_name': latest_message.sender_name if latest_message else None,
                    'created_at': latest_message.created_at.isoformat() if latest_message else None
                } if latest_message else None
            }
            
            conversations_data.append(conversation_data)
        
        return success_response(
            data={'conversations': conversations_data},
            message="Conversations retrieved successfully"
        )
        
    except Exception as e:
        current_app.logger.error(f"Get my conversations error: {str(e)}")
        return error_response("Failed to retrieve conversations", status_code=500)

# Get messages in specific conversation
@tenant_messaging_bp.route('/conversations/<int:conversation_id>/messages', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_conversation_messages(conversation_id):
    """Get messages for a specific conversation or grouped conversations"""
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'OK'})
        return add_cors_headers(response)
    
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return error_response("User not found", status_code=404)
        
        user_role = get_user_role(current_user_id)
        if not user_role:
            return error_response("User role not found", status_code=403)
        
        # Get conversation and verify access
        conversation = TenantConversation.query.get(conversation_id)
        if not conversation:
            return error_response("Conversation not found", status_code=404)
        
        if not has_conversation_access(conversation, current_user_id, user_role):
            return error_response("Access denied", status_code=403)
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 50, type=int)
        
        # For agents/owners, check if this is a grouped conversation
        # by finding all conversations with the same user_id
        if user_role != 'tenant':
            # Get all conversations for the same sender (user_id)
            all_user_conversations = TenantConversation.query.filter(
                and_(
                    TenantConversation.user_id == conversation.user_id,
                    or_(
                        TenantConversation.agent_id == current_user_id,
                        TenantConversation.owner_id == current_user_id
                    )
                )
            ).all()
            
            # Get all conversation IDs for this user
            conversation_ids = [conv.id for conv in all_user_conversations]
            
            # Get messages from all conversations for this user
            messages_query = TenantMessage.query.filter(
                TenantMessage.conversation_id.in_(conversation_ids)
            ).order_by(TenantMessage.created_at)
            
            # Mark all conversations as read for this user
            for conv in all_user_conversations:
                conv.mark_messages_as_read(current_user_id, user_role)
        else:
            # For tenants, only show messages from the specific conversation
            messages_query = TenantMessage.query.filter_by(conversation_id=conversation_id)\
                .order_by(TenantMessage.created_at)
            
            # Mark this conversation as read
            conversation.mark_messages_as_read(current_user_id, user_role)
        
        # Apply pagination
        messages = messages_query.paginate(page=page, per_page=limit, error_out=False)
        
        messages_data = [message.to_dict(user_role) for message in messages.items]
        
        # Commit the read status changes
        db.session.commit()
        
        return success_response(
            data={
                'conversation': conversation.to_dict(user_role),
                'messages': messages_data,
                'pagination': {
                    'total': messages.total,
                    'page': page,
                    'pages': messages.pages,
                    'has_next': messages.has_next,
                    'has_prev': messages.has_prev
                }
            },
            message="Messages retrieved successfully"
        )
        
    except Exception as e:
        current_app.logger.error(f"Get conversation messages error: {str(e)}")
        return error_response("Failed to retrieve messages", status_code=500)



# Send reply message in existing conversation
@tenant_messaging_bp.route('/conversations/<int:conversation_id>/messages', methods=['POST', 'OPTIONS'])
def send_reply_message(conversation_id):
    """Send reply message in existing conversation"""
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'OK'})
        return add_cors_headers(response)
    
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return error_response("User not found", status_code=404)
        
        user_role = get_user_role(current_user_id)
        if not user_role:
            return error_response("User role not found", status_code=403)
        
        # Get conversation and verify access
        conversation = TenantConversation.query.get(conversation_id)
        if not conversation:
            return error_response("Conversation not found", status_code=404)
        
        if not has_conversation_access(conversation, current_user_id, user_role):
            return error_response("Access denied", status_code=403)
        
        data = request.get_json()
        message_text = data.get('message_text', '').strip()
        
        if not message_text:
            return error_response("Message text is required", status_code=400)
        
        # Determine sender type
        if user_role == 'tenant':
            sender_type = 'tenant'
        elif conversation.agent_id == current_user_id:
            sender_type = 'agent'
        else:
            sender_type = 'owner'
        
        # Create message
        message = TenantMessage(
            conversation_id=conversation_id,
            sender_id=current_user_id,
            sender_name=user.full_name,
            sender_type=sender_type,
            message_text=message_text,
            is_read_by_tenant=sender_type == 'tenant',
            is_read_by_agent=sender_type != 'tenant'
        )
        
        db.session.add(message)
        
        # Update conversation
        conversation.last_message_at = datetime.utcnow()
        conversation.status = 'open'
        conversation.increment_unread_for_recipients(sender_type)
        
        db.session.commit()
        
        return success_response(
            data={'message': message.to_dict(user_role)},
            message="Reply sent successfully"
        )
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Send reply message error: {str(e)}")
        return error_response("Failed to send reply", status_code=500)

send_reply_message = jwt_required()(send_reply_message)

# Get unread message count for tenant
@tenant_messaging_bp.route('/unread-count', methods=['GET', 'OPTIONS'])
def get_unread_count():
    """Get unread message count for tenant"""
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'OK'})
        return add_cors_headers(response)
    
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return error_response("User not found", status_code=404)
        
        user_role = get_user_role(current_user_id)
        if not user_role:
            return error_response("User role not found", status_code=403)
        
        # Get total unread count
        if user_role == 'tenant':
            total_unread = db.session.query(db.func.sum(TenantConversation.unread_count_tenant))\
                .filter_by(user_id=current_user_id).scalar() or 0
        else:
            total_unread = db.session.query(db.func.sum(TenantConversation.unread_count_agent))\
                .filter(
                    or_(
                        TenantConversation.agent_id == current_user_id,
                        TenantConversation.owner_id == current_user_id
                    )
                ).scalar() or 0
        
        return success_response(
            data={'unread_count': total_unread},
            message="Unread count retrieved successfully"
        )
        
    except Exception as e:
        current_app.logger.error(f"Get unread count error: {str(e)}")
        return error_response("Failed to retrieve unread count", status_code=500)

get_unread_count = jwt_required()(get_unread_count)

# Close conversation
@tenant_messaging_bp.route('/conversations/<int:conversation_id>/close', methods=['POST', 'OPTIONS'])
def close_conversation(conversation_id):
    """Close conversation"""
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'OK'})
        return add_cors_headers(response)
    
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return error_response("User not found", status_code=404)
        
        user_role = get_user_role(current_user_id)
        if not user_role:
            return error_response("User role not found", status_code=403)
        
        # Get conversation and verify access
        conversation = TenantConversation.query.get(conversation_id)
        if not conversation:
            return error_response("Conversation not found", status_code=404)
        
        if not has_conversation_access(conversation, current_user_id, user_role):
            return error_response("Access denied", status_code=403)
        
        conversation.status = 'closed'
        db.session.commit()
        
        return success_response(
            data={'conversation': conversation.to_dict(user_role)},
            message="Conversation closed successfully"
        )
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Close conversation error: {str(e)}")
        return error_response("Failed to close conversation", status_code=500)

close_conversation = jwt_required()(close_conversation)

# Reopen closed conversation
@tenant_messaging_bp.route('/conversations/<int:conversation_id>/reopen', methods=['POST', 'OPTIONS'])
def reopen_conversation(conversation_id):
    """Reopen closed conversation"""
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'OK'})
        return add_cors_headers(response)
    
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return error_response("User not found", status_code=404)
        
        user_role = get_user_role(current_user_id)
        if not user_role:
            return error_response("User role not found", status_code=403)
        
        # Get conversation and verify access
        conversation = TenantConversation.query.get(conversation_id)
        if not conversation:
            return error_response("Conversation not found", status_code=404)
        
        if not has_conversation_access(conversation, current_user_id, user_role):
            return error_response("Access denied", status_code=403)
        
        conversation.status = 'open'
        db.session.commit()
        
        return success_response(
            data={'conversation': conversation.to_dict(user_role)},
            message="Conversation reopened successfully"
        )
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Reopen conversation error: {str(e)}")
        return error_response("Failed to reopen conversation", status_code=500)

reopen_conversation = jwt_required()(reopen_conversation)

# File upload endpoint (legacy)
@tenant_messaging_bp.route('/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    """Upload a file for messaging"""
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'OK'})
        return add_cors_headers(response)
    
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return error_response("User not found", status_code=404)
        
        if 'file' not in request.files:
            return error_response("No file provided", status_code=400)
        
        file = request.files['file']
        conversation_id = request.form.get('conversation_id')
        
        if file.filename == '':
            return error_response("No file selected", status_code=400)
        
        # If no conversation_id, create temp folder
        temp_conv_id = conversation_id or 'temp'
        
        original_name, file_url, file_size, file_type = handle_attachment_upload(file, temp_conv_id)
        
        if not file_url:
            return error_response("Failed to upload file or invalid file type", status_code=400)
        
        return success_response(
            data={
                'file_url': file_url,
                'file_name': original_name,
                'file_size': file_size,
                'file_type': file_type
            },
            message="File uploaded successfully"
        )
        
    except Exception as e:
        current_app.logger.error(f"File upload error: {str(e)}")
        return error_response("Failed to upload file", status_code=500)

upload_file = jwt_required()(upload_file)

# File download endpoint
@tenant_messaging_bp.route('/download/<path:filename>', methods=['GET'])
def download_file(filename):
    """Download a file attachment"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return error_response("User not found", status_code=404)
        
        # Security check - ensure file path doesn't contain directory traversal
        if '..' in filename or filename.startswith('/'):
            return error_response("Invalid file path", status_code=400)
        
        file_path = os.path.join(current_app.root_path, MESSAGING_UPLOAD_FOLDER, filename)
        
        if not os.path.exists(file_path):
            return error_response("File not found", status_code=404)
        
        return send_file(file_path, as_attachment=True)
        
    except Exception as e:
        current_app.logger.error(f"File download error: {str(e)}")
        return error_response("Failed to download file", status_code=500)

download_file = jwt_required()(download_file)