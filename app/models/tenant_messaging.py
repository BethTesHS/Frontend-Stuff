# app/models/tenant_messaging.py

from app import db
from datetime import datetime
from sqlalchemy import Text, ForeignKey, Boolean, Integer, String, DateTime, func

class TenantConversation(db.Model):
    __tablename__ = 'tenant_conversations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user_name = db.Column(db.String(100), nullable=False)
    user_type = db.Column(db.String(20), default='tenant')
    agent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=True)
    subject = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), default='open')  # open, closed, pending
    last_message_at = db.Column(db.DateTime, default=datetime.utcnow)
    unread_count_tenant = db.Column(db.Integer, default=0)
    unread_count_agent = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='tenant_conversations')
    agent = db.relationship('User', foreign_keys=[agent_id], backref='agent_conversations')
    owner = db.relationship('User', foreign_keys=[owner_id], backref='owner_conversations')
    property = db.relationship('Property', backref='tenant_conversations')
    messages = db.relationship('TenantMessage', backref='conversation', lazy='dynamic', 
                              cascade='all, delete-orphan', order_by='TenantMessage.created_at')

    def increment_unread_for_recipients(self, sender_type):
        """Increment unread count for recipients based on sender type"""
        if sender_type == 'tenant':
            self.unread_count_agent += 1
            self.unread_count_tenant = 0  # Reset tenant count since they sent the message
        else:
            self.unread_count_tenant += 1
            self.unread_count_agent = 0  # Reset agent/owner count since they sent the message

    def mark_messages_as_read(self, user_id, user_role):
        """Mark all messages in conversation as read for the given user"""
        if user_role == 'tenant':
            # Mark all messages as read by tenant
            TenantMessage.query.filter_by(conversation_id=self.id).update({
                'is_read_by_tenant': True
            })
            self.unread_count_tenant = 0
        else:
            # Mark all messages as read by agent/owner
            TenantMessage.query.filter_by(conversation_id=self.id).update({
                'is_read_by_agent': True
            })
            self.unread_count_agent = 0

    def get_unread_count_for_user(self, user_id, user_role):
        """Get unread count for specific user"""
        if user_role == 'tenant':
            return self.unread_count_tenant
        else:
            return self.unread_count_agent

    def get_other_participant(self, current_user_id, user_role):
        """Get info about the other participant in the conversation"""
        if user_role == 'tenant':
            # For tenant, return agent or owner info
            if self.agent_id:
                return {
                    'id': str(self.agent_id),
                    'name': self.agent.full_name if self.agent else 'Unknown Agent',
                    'type': 'agent'
                }
            elif self.owner_id:
                return {
                    'id': str(self.owner_id),
                    'name': self.owner.full_name if self.owner else 'Unknown Owner',
                    'type': 'owner'
                }
        else:
            # For agent/owner, return tenant info
            return {
                'id': str(self.user_id),
                'name': self.user_name,
                'type': 'tenant'
            }
        return None

    def to_dict(self, user_role=None):
        """Convert conversation to dictionary"""
        data = {
            'id': self.id,
            'subject': self.subject,
            'status': self.status,
            'last_message_at': self.last_message_at.isoformat() if self.last_message_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user_name': self.user_name,
            'user_type': self.user_type
        }

        if user_role:
            data['unread_count'] = self.get_unread_count_for_user(None, user_role)

        if self.property:
            data['property'] = {
                'id': str(self.property.id),
                'title': self.property.title,
                'address': f"{self.property.street}, {self.property.city}",
                'city': self.property.city,
                'postcode': self.property.postcode
            }

        return data

    def __repr__(self):
        return f'<TenantConversation {self.id}: {self.subject}>'


class TenantMessage(db.Model):
    __tablename__ = 'tenant_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('tenant_conversations.id'), nullable=False)
    sender_id = db.Column(db.Integer, nullable=False)
    sender_name = db.Column(db.String(100), nullable=False)
    sender_type = db.Column(db.String(20), nullable=False)  # tenant, agent, owner
    message_text = db.Column(db.Text, nullable=False)
    attachment_url = db.Column(db.String(500), nullable=True)
    attachment_name = db.Column(db.String(200), nullable=True)
    attachment_size = db.Column(db.Integer, nullable=True)
    attachment_type = db.Column(db.String(50), nullable=True)
    is_read_by_tenant = db.Column(db.Boolean, default=False)
    is_read_by_agent = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def has_attachment(self):
        """Check if message has an attachment"""
        return bool(self.attachment_url)

    def to_dict(self, user_role=None):
        """Convert message to dictionary"""
        data = {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'sender_id': str(self.sender_id),
            'sender_name': self.sender_name,
            'sender_type': self.sender_type,
            'message_text': self.message_text,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'has_attachment': self.has_attachment()
        }

        if self.has_attachment():
            data.update({
                'attachment_url': self.attachment_url,
                'attachment_name': self.attachment_name,
                'attachment_size': self.attachment_size,
                'attachment_type': self.attachment_type
            })

        # Add read status based on user role
        if user_role == 'tenant':
            data['is_read'] = self.is_read_by_tenant
        elif user_role in ['agent', 'owner']:
            data['is_read'] = self.is_read_by_agent

        return data

    def __repr__(self):
        return f'<TenantMessage {self.id}: {self.sender_name} in conversation {self.conversation_id}>'